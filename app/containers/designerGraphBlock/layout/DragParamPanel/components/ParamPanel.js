import React, { useEffect, useState, useMemo } from 'react';
import { Input, Select, AutoComplete } from 'antd';
import { useSelector } from 'react-redux';
import uniqueId from 'lodash/uniqueId';
import axios from 'axios';

import event from '../../eventCenter';
import { useAIHintWatch, useAppendDataSource } from '../../useHooks';
import api, { config } from '../../../../../api';

import './ParamPanel.scss';

const { Option } = Select;
const { TextArea } = Input;

const COMPONENT_TYPE = {
  INPUT: 0,
  SELECT: 1,
  FILEPATHINPUT: 2,
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
  aiHintList = {}
) => {
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
  }
  switch (param.componentType) {
    case COMPONENT_TYPE.INPUT:
      if (param.enName !== 'outPut') {
        const dataSource =
          param.paramType &&
          Array.isArray(param.paramType) &&
          param.paramType.reduce((prev, next) => {
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
            dataSource={(dataSource || []).concat(appendDataSource)}
            onSelect={value => {
              const handleWatchChange = value => {
                param.value = value;
              };
              const handleMutiply = value => {
                param.value = getVariableList(value)[param.mutiplyIndex];
              };
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
            }}
          >
            <TextArea
              className="custom"
              style={{ height: 32 }}
              onKeyDown={e => stopDeleteKeyDown(e)}
            />
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
    default:
      return '待开发...';
  }
};

export default ({ checkedBlock, cards, handleEmitCodeTransform }) => {
  const [flag, setFlag] = useState(false);

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
            defaultValue={checkedBlock.userDesc}
            onChange={e => {
              checkedBlock.userDesc = e.target.value;
              handleEmitCodeTransform(cards);
            }}
            onKeyDown={e => stopDeleteKeyDown(e)}
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
