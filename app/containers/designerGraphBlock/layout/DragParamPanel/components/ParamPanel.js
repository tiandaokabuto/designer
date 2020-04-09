import React, { useEffect, useState, useMemo } from 'react';
import { Input, Select, AutoComplete } from 'antd';
import { useSelector } from 'react-redux';
import uniqueId from 'lodash/uniqueId';

import event from '../../eventCenter';

import './ParamPanel.scss';

const { Option } = Select;

const typeOf = value => {
  if (/['"]/.test(value)) {
    return 'String';
  }
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
                ? [...new Set(aiHintList[next].map(item => item.value))]
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
  variableList.forEach(item => {});

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
