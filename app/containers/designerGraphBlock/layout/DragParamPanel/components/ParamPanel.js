import React from 'react';
import { Input, Select } from 'antd';
import { useSelector } from 'react-redux';

import { useTransformToPython } from '../../useHooks';

import './ParamPanel.scss';

const { Option } = Select;

const getComponentType = (param, handleEmitCodeTransform, cards) => {
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
