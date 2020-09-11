import './index.scss';

import React, {
  useEffect,
  useState,
  useRef,
  Fragment,
  useCallback,
  memo,
} from 'react';
import { Input, Select, Tooltip, Button, Modal } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import uniqueId from 'lodash/uniqueId';

import event from '@/containers/eventCenter';
import { CHANGE_FORCEUPDATE_TAG } from '../../../../constants/actions/codeblock';
import {
  useAIHintWatch,
  useAppendDataSource,
  useVerifyInput,
} from '../../useHooks';
import ConditionParam from './ConditionParam';
import LoopPanelParam from './LoopPanelParam';
import XPathParam from './components/XPathParam';
import OutputParam from './OutputParam';
import FileParam from './FileParam';
import DirectoryParam from './DirectoryParam';
import TaskDataParam from './TaskDataParam';
import AutoCompletePlusParam from './components/AutoCompletePlusParam';
import RenderWithPlusInput from './components/RenderWithPlusInput';
import { encrypt } from '../../../../login/utils';

const { Option } = Select;

const COMPONENT_TYPE = {
  INPUT: 0,
  SELECT: 1,
  FILEPATHINPUT: 2,
  DIRECTORY: 3,
};

const stopDeleteKeyDown = e => {
  const matchKeyCode = [88];
  if (e.keyCode === 46 || (e.ctrlKey && matchKeyCode.includes(e.keyCode))) {
    e.nativeEvent.stopImmediatePropagation();
    e.stopPropagation();
  }
};

const getComponentType = (
  param,
  handleEmitCodeTransform,
  cards,
  keyFlag,
  aiHintList = {},
  setFlag,
  handleValidate,
  markBlockIsUpdated,
  cmdName,
  isWindowsAuto,
  dispatch,
  forceUpdateTag
) => {
  const [inputValue, setInputValue] = useState(
    param.enName === 'sqlStr'
      ? param.value.replace(/\s%\s.*/g, '')
      : param.value || param.default
  );

  useEffect(() => {
    handleValidate({
      value: param.value,
    });
  }, []);

  const emitCode = () => {
    handleEmitCodeTransform(cards);
  };

  // 任务数据下拉列表
  const [appendDataSource] = useAppendDataSource(param);
  // 针对一些特殊的情况需要作出特殊的处理
  if (param.enName === 'sqlStr') {
    return (
      <div className="sqlstr">
        <RenderWithPlusInput
          render={({ onChange, ...props }) => {
            return (
              <Input
                {...props}
                onChange={e => {
                  onChange(e.target.value);
                  setInputValue(e.target.value);
                }}
                placeholder={param.default}
                onFocus={e => {
                  console.log(String(param.default) === inputValue);
                  if (String(param.default) === inputValue) {
                    setInputValue('');
                  }
                }}
                onBlur={e => {
                  if (inputValue === '') {
                    setInputValue(param.default);
                  }
                }}
              />
            );
          }}
          value={inputValue}
          onChange={value => {
            param.value = value;
            setInputValue(value);
            const numOfPlace = (value.match(/\%s/g) || []).length;
            if (param.placeholder.length < numOfPlace) {
              param.placeholder = param.placeholder.concat(
                new Array(numOfPlace - param.placeholder.length).fill(undefined)
              );
            } else {
              param.placeholder = param.placeholder.slice(0, numOfPlace);
            }
            handleEmitCodeTransform(cards);
          }}
        />
        <span>请填写替换变量</span>
        {param.placeholder.map((place, index) => {
          return (
            <Input
              defaultValue={place}
              key={index}
              style={{
                marginBottom: 8,
              }}
              onChange={e => {
                param.placeholder[index] = e.target.value;
                // 重新调整sql拼接形式
                param.value = `${param.value.replace(
                  /\s%\s.*/g,
                  ''
                )} % (${param.placeholder
                  .filter(item => item !== undefined)
                  .join(', ')})`;
                handleEmitCodeTransform(cards);
              }}
            />
          );
        })}
      </div>
    );
  } else if (param.enName === 'ifcondition') {
    return (
      <ConditionParam
        param={param}
        cards={cards}
        handleEmitCodeTransform={handleEmitCodeTransform}
        keyFlag={keyFlag}
        setFlag={setFlag}
      />
    );
  } else if (param.enName === 'looptype') {
    return (
      <SelectContext.Consumer>
        {({ setLoopSelect }) => (
          <Select
            style={{ width: '100%' }}
            defaultValue={param.value || param.default}
            dropdownMatchSelectWidth={false}
            onChange={value => {
              param.value = value;
              handleEmitCodeTransform(cards);
              setLoopSelect(value);
            }}
          >
            {param.valueMapping &&
              param.valueMapping.map(item => (
                <Option key={item.value} value={item.value}>
                  {item.name}
                </Option>
              ))}
          </Select>
        )}
      </SelectContext.Consumer>
    );
  } else if (param.enName === 'loopcondition') {
    return (
      <SelectContext.Consumer>
        {({ loopSelect }) => (
          <LoopPanelParam
            param={param}
            cards={cards}
            aiHintList={aiHintList}
            appendDataSource={appendDataSource}
            handleValidate={handleValidate}
            loopSelect={loopSelect}
            handleEmitCodeTransform={handleEmitCodeTransform}
            keyFlag={keyFlag}
            setFlag={setFlag}
          />
        )}
      </SelectContext.Consumer>
    );
  } else if (param.enName === 'taskDataName') {
    return (
      <TaskDataParam
        cmdName={cmdName}
        param={param}
        aiHintList={aiHintList}
        appendDataSource={appendDataSource}
        keyFlag={keyFlag}
        handleEmitCodeTransform={emitCode}
        handleValidate={handleValidate}
        markBlockIsUpdated={markBlockIsUpdated}
      />
    );
  } else if (param.enName === '_text') {
    return (
      <SelectContext.Consumer>
        {({ isSelectEncty }) => (
          <AutoCompletePlusParam
            cmdName={cmdName}
            param={param}
            isSelectEncty={isSelectEncty}
            aiHintList={aiHintList}
            appendDataSource={appendDataSource}
            keyFlag={keyFlag}
            handleEmitCodeTransform={() => {
              markBlockIsUpdated();
              handleEmitCodeTransform(cards);
            }}
            handleValidate={handleValidate}
          />
        )}
      </SelectContext.Consumer>
    );
  } else if (param.enName === 'is_encrypt') {
    return (
      <SelectContext.Consumer>
        {({ handleCleanTextValue, handleEnctyTextValue }) => (
          <Select
            style={{ width: '100%' }}
            defaultValue={param.value || param.default}
            dropdownMatchSelectWidth={false}
            onChange={value => {
              param.value = value;
              markBlockIsUpdated();
              if (value === 'False') {
                // 清空密文内容
                handleCleanTextValue();
              } else {
                // 进行内容加密
                handleEnctyTextValue();
              }
              handleEmitCodeTransform(cards);
            }}
          >
            {param.valueMapping &&
              param.valueMapping.map(item => (
                <Option key={item.value} value={item.value}>
                  {item.name}
                </Option>
              ))}
          </Select>
        )}
      </SelectContext.Consumer>
    );
  } else if (param.enName === 'xpath' && !isWindowsAuto) {
    // 针对web浏览器的xpath的获取
    return (
      <XPathParam
        param={param}
        markBlockIsUpdated={markBlockIsUpdated}
        handleEmitCodeTransform={() => {
          handleEmitCodeTransform(cards);
        }}
      />
    );
  }
  // 常规处理
  switch (param.componentType) {
    case COMPONENT_TYPE.INPUT:
      if (param.enName !== 'outPut') {
        return (
          <AutoCompletePlusParam
            cmdName={cmdName}
            param={param}
            aiHintList={aiHintList}
            appendDataSource={appendDataSource}
            keyFlag={keyFlag}
            handleEmitCodeTransform={() => {
              markBlockIsUpdated();
              handleEmitCodeTransform(cards);
            }}
            handleValidate={handleValidate}
          />
        );
      }

      return (
        <RenderWithPlusInput
          render={({ onChange, ...props }) => {
            return (
              <Input
                {...props}
                placeholder={param.default}
                onFocus={e => {
                  if (String(param.default) === inputValue) {
                    setInputValue('');
                  }
                }}
                onBlur={e => {
                  if (inputValue === '') {
                    setInputValue(param.default);
                  }
                }}
                onChange={e => {
                  onChange(e.target.value);
                  setInputValue(e.target.value);
                }}
              />
            );
          }}
          value={inputValue}
          key={keyFlag || param.enName === 'xpath' ? uniqueId('key_') : ''}
          onChange={value => {
            param.value = value;
            setInputValue(value);
            markBlockIsUpdated();
            handleEmitCodeTransform(cards);

            if (param.listeners) {
              param.listeners.forEach(callback => {
                if (typeof callback === 'function') {
                  callback(value);
                }
              });
            }
          }}
        />
      );
    case COMPONENT_TYPE.SELECT:
      return (
        <Select
          mode={
            (cmdName === '键盘-按键' && param.cnName === '按键') ||
            (cmdName === '键盘-目标中按键' && param.cnName === '按键')
              ? 'multiple'
              : ''
          }
          style={{ width: '100%' }}
          defaultValue={param.value || param.default}
          dropdownMatchSelectWidth={false}
          onChange={value => {
            param.value = value;
            dispatch({
              type: CHANGE_FORCEUPDATE_TAG,
              payload: !forceUpdateTag,
            });
            markBlockIsUpdated();
            handleEmitCodeTransform(cards);
          }}
        >
          {param.valueMapping &&
            param.valueMapping.map(item => (
              <Option key={item.value} value={item.value}>
                {item.name}
              </Option>
            ))}
        </Select>
      );
    case COMPONENT_TYPE.FILEPATHINPUT:
      return (
        <DirectoryParam
          key={param.enName}
          param={param}
          keyFlag={keyFlag}
          setFlag={setFlag}
          handleEmitCodeTransform={() => {
            markBlockIsUpdated();
            handleEmitCodeTransform(cards);
          }}
          aiHintList={aiHintList}
          appendDataSource={appendDataSource}
          handleValidate={handleValidate}
        />
      );
    case COMPONENT_TYPE.DIRECTORY:
      return (
        <FileParam
          param={param}
          setFlag={setFlag}
          keyFlag={keyFlag}
          fileType="openDirectory"
          handleEmitCodeTransform={() => {
            markBlockIsUpdated();
            handleEmitCodeTransform(cards);
          }}
        />
      );
    default:
      return '待开发...';
  }
};

const ParamItem = ({
  param,
  handleEmitCodeTransform,
  markBlockIsUpdated,
  cards,
  flag,
  aiHintList,
  setFlag,
  cmdName,
  isWindowsAuto,
  properties,
  dispatch,
  forceUpdateTag,
  required,
}) => {
  const [err, message, handleValidate] = useVerifyInput(param);
  const specialParam = ['条件', '循环条件', '任务数据名称'];
  // const specialParam = ['条件', '循环条件'];

  // 判断是否是关联属性
  const isParentLink = (param, properties) => {
    let flag = false;
    if (param.parentLink) {
      properties.required.forEach(requiredItem => {
        if (requiredItem.enName === param.parentLink.enName) {
          flag = requiredItem;
        }
      });
    }
    return flag;
  };

  // 是否显示关联属性
  const showParentLinkItem = (param, item) => {
    if (item.value.toString() === param.parentLink.value.toString()) {
      return '';
    } else {
      return 'none';
    }
  };

  const linkFlag = isParentLink(param, properties);

  return (
    <React.Fragment>
      <div
        className="parampanel-item"
        style={{
          marginTop: param.cnName === '循环条件' ? 0 : 12,
          display: linkFlag ? showParentLinkItem(param, linkFlag) : '',
        }}
      >
        {specialParam.includes(param.cnName) ||
        param.componentType === COMPONENT_TYPE.FILEPATHINPUT ? (
          ''
        ) : (
          <span className="param-title" title={param.desc}>
            <span style={{ color: 'red' }}>{required ? '* ' : ''}</span>
            <span>{param.cnName}</span>
            <span style={{ color: 'rgba(204,204,204,1)', fontSize: 12 }}>
              {' '}
              ({param.desc})
            </span>
          </span>
        )}
        <div
          className="param-item-wrapper"
          // style={{ flex: 1, overflow: 'hidden' }}
        >
          {getComponentType(
            param,
            handleEmitCodeTransform,
            cards,
            flag,
            aiHintList,
            setFlag,
            handleValidate,
            markBlockIsUpdated,
            cmdName,
            isWindowsAuto,
            dispatch,
            forceUpdateTag
          )}
        </div>
      </div>
      {err && <span style={{ color: 'red' }}>{message}</span>}
    </React.Fragment>
  );
};

const SelectContext = React.createContext({
  loopSelect: 'for_list',
  setLoopSelect: () => {},
  isSelectEncty: false,
  handleCleanTextValue: () => {},
  handleEnctyTextValue: () => {},
});

export default ({ checkedBlock, cards, handleEmitCodeTransform }) => {
  const forceUpdateTag = useSelector(state => state.blockcode.forceUpdateTag);
  const dispatch = useDispatch();
  const { main } = checkedBlock;
  const isDescUseOriginDate = main === 'loop' || main === 'condition';
  const [flag, setFlag] = useState(false);
  const [desc, setDesc] = useState(
    isDescUseOriginDate ? checkedBlock.userDesc : checkedBlock._userDesc
  );
  // loopSelect：循环类型，循环类型更改的时候需要改变循环条件
  const [loopSelect, setLoopSelect] = useState(
    main === 'loop' && checkedBlock.properties.required[0].value
      ? checkedBlock.properties.required[0].value
      : 'for_list'
  );
  // 输入文本，根据是否加密改变文本内容控件
  const [isSelectEncty, setIsSelectEncty] = useState(
    main === 'setText' &&
      checkedBlock.properties.required[4] &&
      checkedBlock.properties.required[4].value
      ? checkedBlock.properties.required[4].value
      : 'False'
  );

  const handleCleanTextValue = () => {
    setIsSelectEncty('False');
    if (main === 'setText') {
      // 从加密切换到明文，清空内容
      checkedBlock.properties.required[3].value = '';
      // 改变id，刷新文本内容中的值
      checkedBlock.properties.required[3].updateId = true;
      // 断开变量推荐的联系
      const { watchDep } = checkedBlock.properties.required[3];
      if (watchDep) {
        if (watchDep.listeners) {
          watchDep.listeners = watchDep.listeners.filter(
            item =>
              item !== checkedBlock.properties.required[3].handleWatchChange
          );
        }
      }
    }
  };

  const handleEnctyTextValue = () => {
    setIsSelectEncty('True');
    // 从明文切换到加密，进行内容加密
    const { value } = checkedBlock.properties.required[3];
    if (value) {
      checkedBlock.properties.required[3].value = encrypt.argEncryptByDES(
        value
      );
    }
  };

  const [aiHintList] = useAIHintWatch();

  const markBlockIsUpdated = useCallback(() => {
    checkedBlock.hasModified = true;
  }, [checkedBlock]);

  useEffect(() => {
    const handleForceUpdate = () => {
      setFlag(true);
      setTimeout(() => {
        setFlag(false);
      }, 50);
    };
    event.addListener('forceUpdate', handleForceUpdate);
    return () => {
      event.removeListener('forceUpdate', handleForceUpdate);
    };
  }, []);

  useEffect(() => {
    window.getSelection().removeAllRanges();
  }, []);

  useEffect(() => {
    setDesc(checkedBlock.userDesc);
  }, [checkedBlock.userDesc]);
  return (
    <div className="parampanel" onKeyDown={e => stopDeleteKeyDown(e)}>
      {checkedBlock && (
        <Fragment>
          <div
            className="parampanel-content"
            style={{ paddingTop: 8 }}
            key={forceUpdateTag ? '0' : '1'}
          >
            <span className="param-title">命令描述符</span>
            <RenderWithPlusInput
              render={({ onChange, ...props }) => {
                return (
                  <Input
                    {...props}
                    onChange={e => {
                      onChange(e.target.value);
                      setDesc(e.target.value);
                    }}
                  />
                );
              }}
              value={desc}
              onChange={value => {
                checkedBlock.userDesc = value;
                setDesc(value);
                handleEmitCodeTransform(cards);
              }}
            />
          </div>
        </Fragment>
      )}
      {checkedBlock.key && checkedBlock.key.indexOf('module') !== -1 ? (
        <Fragment>
          {checkedBlock.properties.map(item => {
            if (item.cnName === '输入参数') {
              return (
                <Fragment>
                  <div className="parampanel-required">{item.cnName}</div>
                  <div className="parampanel-content">
                    {item.value.map(valueItem => {
                      return (
                        <Fragment>
                          <div className="parampanel-item">
                            <span
                              className="param-title"
                              title={valueItem.name}
                            >
                              {valueItem.name}
                            </span>
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                              <Input
                                defaultValue={valueItem.value} // 可以加上 param.default 在参数面板显示默认值
                                onChange={e => {
                                  valueItem.value = e.target.value;
                                  handleEmitCodeTransform(cards);
                                }}
                              />
                            </div>
                          </div>
                        </Fragment>
                      );
                    })}
                  </div>
                </Fragment>
              );
            } else if (item.cnName === '流程块返回') {
              return (
                <Fragment>
                  <div className="parampanel-required">{item.cnName}</div>
                  <div className="parampanel-content">
                    {item.value.map(valueItem => {
                      return (
                        <Fragment>
                          <div className="parampanel-item">
                            <Tooltip placement="left" title={valueItem.value}>
                              <span
                                className="param-title"
                                title={valueItem.name}
                              >
                                返回值
                              </span>
                            </Tooltip>
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                              <Input
                                defaultValue={valueItem.name} // 可以加上 param.default 在参数面板显示默认值
                                onChange={e => {
                                  valueItem.name = e.target.value;
                                  handleEmitCodeTransform(cards);
                                }}
                              />
                            </div>
                          </div>
                        </Fragment>
                      );
                    })}
                  </div>
                </Fragment>
              );
            }
          })}
        </Fragment>
      ) : (
        <Fragment key={forceUpdateTag ? '0' : '1'}>
          {/* <div className="parampanel-required">必选项</div> */}
          <div className="parampanel-content">
            {(checkedBlock.properties.required || []).map((param, index) => {
              if (param.enName === 'return_string') {
                return (
                  <OutputParam
                    key={checkedBlock.id + index}
                    output={param.value}
                    handleEmitCodeTransform={() => {
                      handleEmitCodeTransform(cards);
                    }}
                    markBlockIsUpdated={markBlockIsUpdated}
                  />
                );
              }
              return (
                <SelectContext.Provider
                  value={{
                    loopSelect,
                    setLoopSelect,
                    isSelectEncty,
                    handleCleanTextValue,
                    handleEnctyTextValue,
                  }}
                  key={checkedBlock.id + index}
                >
                  <ParamItem
                    dispatch={dispatch}
                    forceUpdateTag={forceUpdateTag}
                    param={param}
                    handleEmitCodeTransform={handleEmitCodeTransform}
                    markBlockIsUpdated={markBlockIsUpdated}
                    cards={cards}
                    flag={flag}
                    aiHintList={aiHintList}
                    setFlag={setFlag}
                    cmdName={checkedBlock.cmdName}
                    isWindowsAuto={checkedBlock.pkg === 'WindowsAuto'}
                    properties={checkedBlock.properties}
                    required={true}
                  />
                </SelectContext.Provider>
              );
            })}
          </div>
          {/* <div className="parampanel-optional">选填项</div> */}
          <div className="parampanel-content">
            {(checkedBlock.properties.optional || []).map((param, index) => {
              return (
                <ParamItem
                  dispatch={dispatch}
                  forceUpdateTag={forceUpdateTag}
                  properties={checkedBlock.properties}
                  key={checkedBlock.id + index}
                  param={param}
                  handleEmitCodeTransform={handleEmitCodeTransform}
                  markBlockIsUpdated={markBlockIsUpdated}
                  cards={cards}
                  flag={flag}
                  aiHintList={aiHintList}
                  setFlag={setFlag}
                  cmdName={checkedBlock.cmdName}
                  required={false}
                />
              );
            })}
          </div>
        </Fragment>
      )}
    </div>
  );
};
