import React, { Fragment } from 'react';
import { Icon, Input } from 'antd';
import uniqueId from 'lodash/uniqueId';
import useForceUpdate from 'react-hook-easier/lib/useForceUpdate';

import { useNoticyBlockCodeChange } from '../../../../designerGraphBlock/layout/useHooks';
import event from '../../../../designerGraphBlock/layout/eventCenter';

import './VariablePanel.scss';

export default ({
  blockNode,
  label = '设置变量',
  disabled,
  handleEmitCodeTransform,
}) => {
  const [flag, forceUpdate] = useForceUpdate();
  const noticyChange = useNoticyBlockCodeChange();

  const variableList = (blockNode && blockNode.variable) || null;
  const handleVariableAdd = () => {
    variableList.push({
      name: '',
      value: '',
    });
    noticyChange();
    forceUpdate();
  };
  const handleVariableDelete = index => {
    variableList.splice(index, 1);
    noticyChange();
    forceUpdate();
  };
  if (variableList === null) return null;
  return (
    <div className="variablePanel">
      <div className="variablePanel-title">
        <span>{label}</span>
        {disabled ? (
          <span></span>
        ) : (
          <Icon
            type="plus"
            className="variablePanel-btn"
            onClick={() => {
              handleVariableAdd();
            }}
          />
        )}
      </div>
      <div className="variablePanel-container">
        <span>变量名</span>
        <span>值</span>
        <span></span>
        {(variableList || []).map((varibale, index) => {
          return (
            <Fragment key={index}>
              <Input
                placeholder="变量"
                value={varibale.name}
                // key={uniqueId('variable_')}
                onChange={e => {
                  varibale.name = e.target.value;
                  if (varibale.listeners) {
                    varibale.listeners.forEach(callback => {
                      if (typeof callback === 'function') {
                        callback(e.target.value);
                      }
                    });
                  }
                  noticyChange();
                  handleEmitCodeTransform && handleEmitCodeTransform();
                }}
              />
              {disabled ? (
                <span style={{ marginLeft: 6 }}>{varibale.value}</span>
              ) : (
                <Input
                  placeholder="值"
                  value={varibale.value}
                  onChange={e => {
                    varibale.value = e.target.value;
                    noticyChange();
                    handleEmitCodeTransform && handleEmitCodeTransform();
                  }}
                />
              )}
              {disabled ? (
                <span></span>
              ) : (
                <Icon
                  type="delete"
                  className="variablePanel-btn"
                  onClick={() => {
                    handleVariableDelete(index);
                    handleEmitCodeTransform && handleEmitCodeTransform();
                    event.emit('varibaleDelete', varibale);
                  }}
                />
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};
