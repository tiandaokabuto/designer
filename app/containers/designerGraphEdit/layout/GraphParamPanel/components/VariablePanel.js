import React, { Fragment } from 'react';
import { Icon, Input } from 'antd';
import uniqueId from 'lodash/uniqueId';
import useForceUpdate from 'react-hook-easier/lib/useForceUpdate';

import './VariablePanel.scss';

export default ({ blockNode }) => {
  const [flag, forceUpdate] = useForceUpdate();

  const variableList = (blockNode && blockNode.variable) || null;
  const handleVariableAdd = () => {
    variableList.push({
      name: '',
      value: '',
    });
    forceUpdate();
  };
  const handleVariableDelete = index => {
    variableList.splice(index, 1);
    forceUpdate();
  };
  if (variableList === null) return null;
  return (
    <div className="variablePanel">
      <div className="variablePanel-title">
        <span>设置变量</span>
        <Icon
          type="plus"
          className="variablePanel-btn"
          onClick={() => {
            handleVariableAdd();
          }}
        />
      </div>
      <div className="variablePanel-container">
        <span>变量名</span>
        <span>值</span>
        <span></span>
        {variableList.map((varibale, index) => {
          return (
            <Fragment key={index}>
              <Input
                placeholder="变量"
                defaultValue={varibale.name}
                key={uniqueId('variable_')}
                onChange={e => {
                  varibale.name = e.target.value;
                }}
              />
              <Input
                placeholder="值"
                defaultValue={varibale.value}
                key={uniqueId('variable_')}
                onChange={e => {
                  varibale.value = e.target.value;
                }}
              />
              <Icon
                type="delete"
                className="variablePanel-btn"
                onClick={() => {
                  handleVariableDelete(index);
                }}
              />
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};
