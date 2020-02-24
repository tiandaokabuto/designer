import React from 'react';
import { Input, Select } from 'antd';
import { useSelector } from 'react-redux';

import { useTransformToPython } from '../../useHooks';

import './ParamPanel.scss';

const { Option } = Select;

const getComponentType = (param, handleEmitCodeTransform, cards) => {
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
<<<<<<< HEAD
              defaultValue={place}
=======
>>>>>>> 9f2f6e8335bd3cf68272ba8a39b9bc9cf0efc800
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
                console.log(param.value);
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
      return (
        <Input
          defaultValue={param.value || param.default}
          key={param.enName === 'xpath' ? param.value : ''}
          onChange={e => {
            param.value = e.target.value;
            handleEmitCodeTransform(cards);
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
          {param.valueMapping.map(item => (
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

export default ({ checkedBlock }) => {
  const cards = useSelector(state => state.blockcode.cards);
  const handleEmitCodeTransform = useTransformToPython();
  return (
    <div className="parampanel">
      <div className="parampanel-required">必选项</div>
      <div className="parampanel-content">
        {(checkedBlock.properties.required || []).map((param, index) => {
          return (
            <div key={checkedBlock.id + index} className="parampanel-item">
              <span className="param-title">{param.cnName}</span>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                {getComponentType(param, handleEmitCodeTransform, cards)}
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
              <span className="param-title">{param.cnName}</span>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                {getComponentType(param, handleEmitCodeTransform, cards)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
