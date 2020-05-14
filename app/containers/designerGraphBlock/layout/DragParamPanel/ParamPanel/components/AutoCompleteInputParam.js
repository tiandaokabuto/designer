import React, { useState } from 'react';
import { AutoComplete, Input } from 'antd';
import PropTypes from 'prop-types';
import uniqueId from 'lodash/uniqueId';
import { useMemo } from 'react';

const { TextArea } = Input;

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

const AutoCompleteInputParam = ({
  param,
  aiHintList,
  appendDataSource,
  keyFlag,
  handleEmitCodeTransform,
  handleValidate,
  onChange,
}) => {
  const [positionId, setPositionId] = useState('positon');
  const { paramType } = param;
  const hasParamType = paramType && Array.isArray(paramType);
  // 待匹配的下拉列表
  const dataSource =
    hasParamType &&
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
    }, []);
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
    if (onChange) onChange(value);
  };
  const handleMutiply = value => {
    const newValue = getVariableList(value)[param.mutiplyIndex];
    param.value = newValue;
    if (onChange) onChange(newValue);
  };

  const id = useMemo(() => {
    if (keyFlag || param.enName === 'xpath') {
      return uniqueId('key_');
    } else if (param.enName === 'position') {
      if (param.updateId) {
        if (positionId === 'position') {
          setPositionId('triggleposition');
          param.updateId = false;
          return 'triggleposition';
        } else {
          setPositionId('position');
          param.updateId = false;
          return 'position';
        }
      }
      return positionId;
    }
    return '';
  }, [keyFlag, param.enName, param.updateId]);

  return (
    <AutoComplete
      key={id}
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
        handleEmitCodeTransform();
        // 验证
        handleValidate({
          value,
        });
        if (onChange) onChange(value);
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
};

AutoCompleteInputParam.propTypes = {
  param: PropTypes.object.isRequired,
  aiHintList: PropTypes.object,
  appendDataSource: PropTypes.array,
  keyFlag: PropTypes.bool.isRequired,
  handleEmitCodeTransform: PropTypes.func.isRequired,
  handleValidate: PropTypes.func.isRequired,
  onChange: PropTypes.func,
};

AutoComplete.defaultProps = {
  aiHintList: {},
};

export default AutoCompleteInputParam;
