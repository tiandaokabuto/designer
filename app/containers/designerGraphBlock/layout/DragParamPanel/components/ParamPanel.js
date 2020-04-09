import React, { useEffect, useState, useMemo } from 'react';
import { Input, Select, AutoComplete } from 'antd';
import { useSelector } from 'react-redux';
import uniqueId from 'lodash/uniqueId';

import event from '../../eventCenter';

import './ParamPanel.scss';

const { Option } = Select;

// Number（数字）
// String（字符串）
// List（列表）
// Dictionary（字典）
// bool（布尔

const typeOf = value => {
  if (/['"]/.test(value)) {
    return 'String';
  } else if (/^True$|^False$/.test(value)) {
    return 'Boolean';
  } else if (/^[0-9]+$/.test(value)) {
    return 'Number';
  } else if (/\[|\]/.test(value)) {
    return 'List';
  } else if (/\{|\}/.test(value)) {
    return 'Dictionary';
  } else {
    return undefined;
  }
};

const removeDuplicateItem = (aiHintList, item) => {
  Object.values(aiHintList).forEach(list => {
    const index = list.findIndex(child => child === item);
    if (index !== -1) {
      list.splice(index, 1);
    }
  });
};

const getComponentType = (
  param,
  handleEmitCodeTransform,
  cards,
  keyFlag,
  aiHintList = {}
) => {
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
            />
          );
        })}
      </div>
    );
  }
  switch (param.componentType) {
    case 0:
      if (param.enName !== 'outPut') {
        const dataSource =
          param.paramType &&
          Array.isArray(param.paramType) &&
          param.paramType.reduce((prev, next) => {
            return prev.concat(
              aiHintList[next]
                ? [
                    ...new Set(
                      aiHintList[next].map(item => item.value).filter(Boolean)
                    ),
                  ]
                : []
            );
          }, []);
        const depList =
          (param.paramType &&
            Array.isArray(param.paramType) &&
            param.paramType.reduce((prev, next) => {
              return prev.concat(aiHintList[next] || []);
            }, [])) ||
          [];

        return (
          <AutoComplete
            key={keyFlag || param.enName === 'xpath' ? uniqueId('key_') : ''}
            defaultValue={String(param.value || param.default)}
            dataSource={dataSource || []}
            onSelect={value => {
              const handleWatchChange = value => {
                param.value = value;
              };
              const dep = depList.find(item => item.value === value);
              if (dep) {
                if (dep.listeners) {
                  dep.listeners.push(handleWatchChange);
                } else {
                  dep.listeners = [handleWatchChange];
                }
                param.watchDep = dep;
                param.handleWatchChange = handleWatchChange;
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
            }}
          />
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
                callback(e.target.value);
              });
            }
          }}
        />
      );
    case 1:
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
    default:
      return <Input />;
  }
};

export default ({ checkedBlock, cards, handleEmitCodeTransform }) => {
  const [flag, setFlag] = useState(false);
  const aiHintList = useSelector(state => state.blockcode.aiHintList);

  const graphDataMap = useSelector(state => state.grapheditor.graphDataMap);

  const checkedGraphBlockId = useSelector(
    state => state.grapheditor.checkedGraphBlockId
  );

  const variableList = useMemo(() => {
    if (graphDataMap && checkedGraphBlockId) {
      const variable = graphDataMap.get(checkedGraphBlockId).variable || [];
      return variable;
    }
    return [];
  }, [graphDataMap, checkedGraphBlockId]);

  console.log(aiHintList, variableList);
  variableList.forEach(item => {
    if (item.name && item.value) {
      const type = typeOf(item.value);
      if (type === undefined) return;
      removeDuplicateItem(aiHintList, item);
      if (aiHintList[type]) {
        if (aiHintList[type].find(el => el === item)) return;
        aiHintList[type].push(item);
      } else {
        aiHintList[type] = [item];
      }
    }
  });

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
    const handleVariableDelete = item => {
      console.log('kkkkkkkkk');
      removeDuplicateItem(aiHintList, item);
    };
    event.addListener('varibaleDelete', handleVariableDelete);
    return () => {
      event.removeListener('varibaleDelete', handleVariableDelete);
    };
  }, [aiHintList]);

  return (
    <div className="parampanel">
      {checkedBlock && (
        <div className="parampanel-desc">
          <span>命令描述符</span>
          <Input
            defaultValue={checkedBlock.userDesc}
            onChange={e => {
              checkedBlock.userDesc = e.target.value;
              handleEmitCodeTransform(cards);
            }}
            onKeyDown={e => {
              if (e.keyCode === 46) {
                e.nativeEvent.stopImmediatePropagation();
              }
            }}
          />
        </div>
      )}
      <div className="parampanel-required">必选项</div>
      <div className="parampanel-content">
        {(checkedBlock.properties.required || []).map((param, index) => {
          return (
            <div key={checkedBlock.id + index} className="parampanel-item">
              <span className="param-title" title={param.desc}>
                {param.cnName}
              </span>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                {getComponentType(
                  param,
                  handleEmitCodeTransform,
                  cards,
                  flag,
                  aiHintList
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="parampanel-optional">选填项</div>
      <div className="parampanel-content">
        {(checkedBlock.properties.optional || []).map((param, index) => {
          return (
            <div key={checkedBlock.id + index} className="parampanel-item">
              <span className="param-title" title={param.desc}>
                {param.cnName}
              </span>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                {getComponentType(param, handleEmitCodeTransform, cards, flag)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
