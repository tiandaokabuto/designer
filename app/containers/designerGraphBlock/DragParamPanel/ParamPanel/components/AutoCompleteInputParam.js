import React, { useState, useRef } from 'react';
import { AutoComplete, Input } from 'antd';
import PropTypes from 'prop-types';
import uniqueId from 'lodash/uniqueId';
import { useMemo } from 'react';

import { encrypt } from '../../../../../login/utils';

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

const noAiHintListNames = [
  '查询任务数据',
  '新增任务数据',
  '消费任务数据',
  '查询任务数据',
  '查询变量值',
  '设置变量值',
];

const AutoCompleteInputParam = React.forwardRef(
  (
    {
      param,
      aiHintList,
      appendDataSource,
      keyFlag,
      handleEmitCodeTransform,
      handleValidate,
      onChange,
      isSelectEncty,
      cmdName,
    },
    ref
  ) => {
    // 对密文进行解密
    const defaultValue = () => {
      const value = String(param.value || param.default);
      if (param.enName === '_text' && isSelectEncty === 'True') {
        return encrypt.argDecryptByDES(value);
      }
      return value;
    };

    const stopDeleteKeyDown = e => {
      const matchKeyCode = [67, 86, 88, 90];
      if (e.keyCode === 46 || (e.ctrlKey && matchKeyCode.includes(e.keyCode))) {
        e.nativeEvent.stopImmediatePropagation();
        e.stopPropagation();
      }
    };

    const [positionId, setPositionId] = useState('positon');
    const [inputValue, setInputValue] = useState(defaultValue());

    const { paramType } = param;
    const hasParamType = paramType && Array.isArray(paramType);
    // 待匹配的下拉列表
    let dataSource =
      hasParamType &&
      !noAiHintListNames.includes(cmdName) &&
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

    dataSource = dataSource ? Array.from(new Set(dataSource)) : dataSource;

    console.log(dataSource);
    // 待匹配的依赖项
    const depList =
      (hasParamType &&
        paramType.reduce((prev, next) => {
          return prev.concat(aiHintList[next] || []);
        }, [])) ||
      [];
    console.log(depList);

    const needTextArea =
      paramType === 0 ||
      (Array.isArray(paramType) &&
        paramType.length === 1 &&
        paramType[0] === 'Number');

    const handleWatchChange = value => {
      // 如果需要加密，在进行变量更新时，对内容进行加密
      let newValue = value;
      if (isSelectEncty) {
        newValue = encrypt.argEncryptByDES(value);
      }
      param.value = newValue;
      setInputValue(newValue);
      // 更改后，编译py代码
      handleEmitCodeTransform();
      if (onChange) onChange(newValue);
    };
    const handleMutiply = value => {
      let newValue = getVariableList(value)[param.mutiplyIndex];
      // 如果需要加密，在进行变量更新时，对内容进行加密
      if (isSelectEncty) {
        newValue = encrypt.argEncryptByDES(newValue);
      }
      // 更改后，编译py代码
      handleEmitCodeTransform();
      if (onChange) onChange(newValue);
    };

    const id = useMemo(() => {
      if (param.enName === 'position') {
        if (param.updateId) {
          if (positionId === 'position') {
            setPositionId('triggleposition');
            param.updateId = false;
            setInputValue(param.value);
            return 'triggleposition';
          } else {
            setPositionId('position');
            param.updateId = false;
            setInputValue(param.value);
            return 'position';
          }
        }
        return positionId;
      } else if (param.updateId) {
        param.updateId = false;
        setInputValue(param.value);
        return uniqueId('key_');
      }
      return '';
    }, [keyFlag, param.enName, param.updateId]);

    const renderChild = () => {
      if (param.enName === '_text' && isSelectEncty === 'True') {
        return <Input.Password visibilityToggle={false} />;
      } else if (!needTextArea) {
        return (
          <TextArea className="custom" style={{ height: 32, width: '100%' }} />
        );
      }
      return null;
    };

    return (
      <AutoComplete
        onKeyDown={e => stopDeleteKeyDown(e)}
        key={id}
        ref={ref}
        value={inputValue}
        dataSource={(dataSource || []).concat(appendDataSource)}
        placeholder={param.default === 0 ? '0' : param.default}
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
          let newValue = value;
          if (param.enName === '_text' && isSelectEncty === 'True' && value) {
            newValue = encrypt.argEncryptByDES(value);
          }
          param.value = newValue;
          setInputValue(newValue);
          handleEmitCodeTransform();
          // 验证
          handleValidate({
            value,
          });
          if (onChange) onChange(newValue);
        }}
        onFocus={() => {
          // 默认值跟当前值相等，清空重新输入
          // console.log(String(ref.current.props.placeholder) === inputValue);
          if (String(ref.current.props.placeholder) === inputValue) {
            ref.current.props.onChange('');
          }
        }}
        onBlur={() => {
          // console.log(ref.current.props.placeholder);
          // 当前输入框为空
          if (inputValue === '') {
            ref.current.props.onChange(String(ref.current.props.placeholder));
          }
        }}
        // 不对DataSource进行查询，详情咨询吴炯
        filterOption={() => true}
      >
        {renderChild()}
      </AutoComplete>
    );
  }
);

AutoCompleteInputParam.propTypes = {
  param: PropTypes.object.isRequired,
  aiHintList: PropTypes.object,
  appendDataSource: PropTypes.array,
  keyFlag: PropTypes.bool.isRequired,
  handleEmitCodeTransform: PropTypes.func.isRequired,
  handleValidate: PropTypes.func.isRequired,
  onChange: PropTypes.func,
  isSelectEncty: PropTypes.string,
};

AutoCompleteInputParam.defaultProps = {
  aiHintList: {},
  onChange: () => {},
  isSelectEncty: 'Flase',
};

export default AutoCompleteInputParam;
