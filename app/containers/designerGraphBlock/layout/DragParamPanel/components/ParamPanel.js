import './ParamPanel.scss';

import React, { useEffect, useState, Fragment } from 'react';
import { Input, Select, AutoComplete, Tooltip } from 'antd';
import uniqueId from 'lodash/uniqueId';

import event from '../../eventCenter';
import {
  useAIHintWatch,
  useAppendDataSource,
  useVerifyInput,
} from '../../useHooks';
import ConditionParam from './ConditionParam';
import LoopConditionParam from './LoopPanelParam/index';
import OutputPanel from './OutputPanel';
import FileParam from './FileParam';
import FileParamPanel from './FileParamPanel';
import TaskDataName from './TaskDataName';
// import AutoCompleteInputParam from './AutoCompleteInputParam';

const { Option } = Select;
const { TextArea } = Input;

const COMPONENT_TYPE = {
  INPUT: 0,
  SELECT: 1,
  FILEPATHINPUT: 2,
  DIRECTORY: 3,
};

const getMutiplyValue = (item, type) => {
  const tempOutput = item.value.replace(/\(|\)/g, '');
  const result = [];
  if (tempOutput) {
    const variableList = tempOutput.split(',');
    item.paramType.forEach((group, index) => {
      if (group.find(el => el === type)) {
        result.push(variableList[index]);
      }
    });
    return result;
  }
  return [];
};

const getVariableList = item => {
  const tempOutput =
    typeof item === 'string'
      ? item.replace(/\(|\)/g, '')
      : item.value.replace(/\(|\)/g, '');
  if (tempOutput) {
    return tempOutput.split(',');
  }
  return [];
};

const stopDeleteKeyDown = e => {
  if (e.keyCode === 46) {
    e.nativeEvent.stopImmediatePropagation();
  }
};

const getComponentType = (
  param,
  handleEmitCodeTransform,
  cards,
  keyFlag,
  aiHintList = {},
  setFlag,
  handleValidate
) => {
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
        <Input
          defaultValue={param.value.replace(/\s%\s.*/g, '')}
          onChange={e => {
            param.value = e.target.value;
            const numOfPlace = (e.target.value.match(/\%s/g) || []).length;
            if (param.placeholder.length < numOfPlace) {
              param.placeholder = param.placeholder.concat(
                new Array(numOfPlace - param.placeholder.length).fill(undefined)
              );
            } else {
              param.placeholder = param.placeholder.slice(0, numOfPlace);
            }
            handleEmitCodeTransform(cards);
          }}
          onKeyDown={e => stopDeleteKeyDown(e)}
        />
        请填写替换变量
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
                param.value =
                  param.value.replace(/\s%\s.*/g, '') +
                  ` % (${param.placeholder
                    .filter(item => item !== undefined)
                    .join(', ')})`;
                handleEmitCodeTransform(cards);
              }}
              onKeyDown={e => stopDeleteKeyDown(e)}
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
        stopDeleteKeyDown={stopDeleteKeyDown}
        keyFlag={keyFlag}
        setFlag={setFlag}
      />
    );
  } else if (param.enName === 'looptype') {
    return (
      <LoopSelectContext.Consumer>
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
      </LoopSelectContext.Consumer>
    );
  } else if (param.enName === 'loopcondition') {
    return (
      <LoopSelectContext.Consumer>
        {({ loopSelect }) => (
          <LoopConditionParam
            param={param}
            cards={cards}
            aiHintList={aiHintList}
            appendDataSource={appendDataSource}
            handleValidate={handleValidate}
            loopSelect={loopSelect}
            stopDeleteKeyDown={stopDeleteKeyDown}
            handleEmitCodeTransform={handleEmitCodeTransform}
            keyFlag={keyFlag}
            setFlag={setFlag}
          />
        )}
      </LoopSelectContext.Consumer>
    );
  } else if (param.enName === 'taskDataName') {
    return (
      <TaskDataName
        param={param}
        aiHintList={aiHintList}
        appendDataSource={appendDataSource}
        keyFlag={keyFlag}
        handleEmitCodeTransform={emitCode}
        handleValidate={handleValidate}
      />
    );
  }
  switch (param.componentType) {
    case COMPONENT_TYPE.INPUT:
      if (param.enName !== 'outPut') {
        /* return (
          <AutoCompleteInputParam
            param={param}
            aiHintList={aiHintList}
            appendDataSource={appendDataSource}
            keyFlag={keyFlag}
            handleEmitCodeTransform={() => handleEmitCodeTransform(cards)}
            handleValidate={handleValidate}
          />
        ); */
        const paramType = param.paramType;
        const hasParamType = paramType && Array.isArray(paramType);
        // 待匹配的下拉列表
        const dataSource =
          hasParamType &&
          Array.from(
            new Set(
              paramType.reduce((prev, next) => {
                return prev.concat(
                  aiHintList[next]
                    ? [
                        ...new Set(
                          aiHintList[next]
                            .map(item =>
                              item.isVariable
                                ? item.name
                                : item.isMutiply
                                ? getMutiplyValue(item, next)
                                : item.value
                            )
                            .flat()
                            .filter(Boolean)
                        ),
                      ]
                    : []
                );
              }, [])
            )
          );
        // 待匹配的依赖项
        const depList =
          (hasParamType &&
            paramType.reduce((prev, next) => {
              return prev.concat(aiHintList[next] || []);
            }, [])) ||
          [];

        const needTextArea =
          paramType === 0 ||
          (Array.isArray(paramType) &&
            paramType.length === 1 &&
            paramType[0] === 'Number');

        const handleWatchChange = value => {
          param.value = value;
        };
        const handleMutiply = value => {
          param.value = getVariableList(value)[param.mutiplyIndex];
        };

        return (
          <AutoComplete
            key={keyFlag || param.enName === 'xpath' ? uniqueId('key_') : ''}
            defaultValue={String(param.value || param.default)}
            dataSource={(dataSource || []).concat(appendDataSource)}
            onSelect={value => {
              const dep = depList.find(item => {
                if (item.isVariable) {
                  return item.name === value;
                }
                if (item.isMutiply) {
                  return item.value
                    .replace(/\)|\(/g, '')
                    .split(',')
                    .find(child => child === value);
                }
                return item.value === value;
              });

              if (dep) {
                const handleChange = dep.isMutiply
                  ? handleMutiply
                  : handleWatchChange;
                if (dep.listeners) {
                  dep.listeners.push(handleChange);
                } else {
                  dep.listeners = [handleChange];
                }
                const variableList = getVariableList(dep);
                param.watchDep = dep;
                param.mutiplyIndex = variableList.findIndex(el => el === value);
                param.handleWatchChange = handleChange;
              }
            }}
            onChange={value => {
              if (param.watchDep) {
                if (param.watchDep.listeners) {
                  param.watchDep.listeners = param.watchDep.listeners.filter(
                    item => item !== param.handleWatchChange
                  );
                }
              }
              param.value = value;
              handleEmitCodeTransform(cards);
              // 验证
              handleValidate({
                value,
              });
            }}
            // 不对DataSource进行查询，详情咨询吴炯
            filterOption={() => true}
          >
            {!needTextArea ? (
              <TextArea
                className="custom"
                style={{ height: 32 }}
                onKeyDown={e => stopDeleteKeyDown(e)}
              />
            ) : null}
          </AutoComplete>
        );
      }
      return (
        <Input
          defaultValue={param.value || param.default} // 可以加上 param.default 在参数面板显示默认值
          key={keyFlag || param.enName === 'xpath' ? uniqueId('key_') : ''}
          onChange={e => {
            param.value = e.target.value;
            handleEmitCodeTransform(cards);
            if (param.listeners) {
              param.listeners.forEach(callback => {
                if (typeof callback === 'function') {
                  callback(e.target.value);
                }
              });
            }
          }}
          onKeyDown={e => stopDeleteKeyDown(e)}
        />
      );
    case COMPONENT_TYPE.SELECT:
      return (
        <Select
          style={{ width: '100%' }}
          defaultValue={param.value || param.default}
          dropdownMatchSelectWidth={false}
          onChange={value => {
            param.value = value;
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
        <FileParamPanel
          key={param.enName}
          param={param}
          keyFlag={keyFlag}
          setFlag={setFlag}
          handleEmitCodeTransform={() => {
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
  cards,
  flag,
  aiHintList,
  setFlag,
}) => {
  const [err, message, handleValidate] = useVerifyInput(param);
  const specialParam = ['条件', '循环条件', '任务数据名称'];
  // const specialParam = ['条件', '循环条件'];

  return (
    <React.Fragment>
      <div className="parampanel-item">
        {specialParam.includes(param.cnName) ||
        param.componentType === COMPONENT_TYPE.FILEPATHINPUT ? (
          ''
        ) : (
          <span className="param-title" title={param.desc}>
            {param.cnName}
          </span>
        )}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {getComponentType(
            param,
            handleEmitCodeTransform,
            cards,
            flag,
            aiHintList,
            setFlag,
            handleValidate
          )}
        </div>
      </div>
      {err && <span style={{ color: 'red' }}>{message}</span>}
    </React.Fragment>
  );
};

const LoopSelectContext = React.createContext({
  loopSelect: 'for_list',
  toggleLoopSelect: () => {},
});

export default ({ checkedBlock, cards, handleEmitCodeTransform }) => {
  const [flag, setFlag] = useState(false);
  // loopSelect：循环类型，循环类型更改的时候需要改变循环条件
  const [loopSelect, setLoopSelect] = useState(
    checkedBlock.main === 'loop' && checkedBlock.properties.required[0].value
      ? checkedBlock.properties.required[0].value
      : 'for_list'
  );
  const [aiHintList] = useAIHintWatch();

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

  return (
    <div className="parampanel">
      {checkedBlock && (
        <div className="parampanel-desc">
          <span>命令描述符</span>
          <Input
            defaultValue={checkedBlock._userDesc}
            onChange={e => {
              checkedBlock.userDesc = e.target.value;
              handleEmitCodeTransform(cards);
            }}
            onKeyDown={e => stopDeleteKeyDown(e)}
          />
        </div>
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
                              变量名
                            </span>
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                              <Input
                                defaultValue={valueItem.name} // 可以加上 param.default 在参数面板显示默认值
                                onChange={e => {
                                  valueItem.name = e.target.value;
                                  handleEmitCodeTransform(cards);
                                }}
                                onKeyDown={e => stopDeleteKeyDown(e)}
                              />
                            </div>
                          </div>
                          <div className="parampanel-item">
                            <span
                              className="param-title"
                              title={valueItem.name}
                            >
                              {item.cnName === '流程块返回' ? '描述' : '值'}
                            </span>
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                              <Input
                                defaultValue={valueItem.value} // 可以加上 param.default 在参数面板显示默认值
                                onChange={e => {
                                  valueItem.value = e.target.value;
                                  handleEmitCodeTransform(cards);
                                }}
                                onKeyDown={e => stopDeleteKeyDown(e)}
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
                                onKeyDown={e => stopDeleteKeyDown(e)}
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
        <Fragment>
          <div className="parampanel-required">必选项</div>
          <div className="parampanel-content">
            {(checkedBlock.properties.required || []).map((param, index) => {
              if (param.enName === 'return_string') {
                return (
                  <OutputPanel
                    key={checkedBlock.id + index}
                    output={param.value}
                    handleEmitCodeTransform={() => {
                      handleEmitCodeTransform(cards);
                    }}
                  />
                );
              }
              return (
                <LoopSelectContext.Provider
                  value={{ loopSelect, setLoopSelect }}
                  key={checkedBlock.id + index}
                >
                  <ParamItem
                    param={param}
                    handleEmitCodeTransform={handleEmitCodeTransform}
                    cards={cards}
                    flag={flag}
                    aiHintList={aiHintList}
                    setFlag={setFlag}
                  />
                </LoopSelectContext.Provider>
              );
            })}
          </div>
          <div className="parampanel-optional">选填项</div>
          <div className="parampanel-content">
            {(checkedBlock.properties.optional || []).map((param, index) => {
              return (
                <ParamItem
                  key={checkedBlock.id + index}
                  param={param}
                  handleEmitCodeTransform={handleEmitCodeTransform}
                  cards={cards}
                  flag={flag}
                  aiHintList={aiHintList}
                  setFlag={setFlag}
                />
              );
            })}
          </div>
        </Fragment>
      )}
      {/* <div className="parampanel-required">必选项</div>
      <div className="parampanel-content">
        {(checkedBlock.properties.required || []).map((param, index) => {
          if (param.enName === 'return_string') {
            return (
              <OutputPanel
                key={checkedBlock.id + index}
                output={param.value}
                handleEmitCodeTransform={() => {
                  handleEmitCodeTransform(cards);
                }}
              />
            );
          }
          return (
            <LoopSelectContext.Provider
              key={checkedBlock.id + index}
              value={{ loopSelect, setLoopSelect }}
            >
              <ParamItem
                param={param}
                handleEmitCodeTransform={handleEmitCodeTransform}
                cards={cards}
                flag={flag}
                aiHintList={aiHintList}
                setFlag={setFlag}
              />
            </LoopSelectContext.Provider>
          );
        })}
      </div>
      <div className="parampanel-optional">选填项</div>
      <div className="parampanel-content">
        {(checkedBlock.properties.optional || []).map((param, index) => {
          return (
            <ParamItem
              key={checkedBlock.id + index}
              param={param}
              handleEmitCodeTransform={handleEmitCodeTransform}
              cards={cards}
              flag={flag}
              aiHintList={aiHintList}
              setFlag={setFlag}
            />
          );
        })}
      </div> */}
    </div>
  );
};
