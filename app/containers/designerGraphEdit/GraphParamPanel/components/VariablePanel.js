import React, { Fragment } from 'react';
import { Icon, Input } from 'antd';
import uniqueId from 'lodash/uniqueId';
import useForceUpdate from 'react-hook-easier/lib/useForceUpdate';

import { useNoticyBlockCodeChange } from '../../../designerGraphBlock/useHooks';
import { synchroGraphDataToProcessTree } from '../../../reduxActions';
import event from '@/containers/eventCenter';

import './VariablePanel.scss';

export default ({
  blockNode,
  label = '设置变量',
  disabled,
  handleEmitCodeTransform,
  global = false,
}) => {
  console.log(global);
  const [flag, forceUpdate] = useForceUpdate();
  const noticyChange = useNoticyBlockCodeChange();

  const variableList = (blockNode && blockNode.variable) || null;
  const handleVariableAdd = () => {
    if (variableList) {
      const id = variableList.length
        ? variableList[variableList.length - 1].id
          ? variableList[variableList.length - 1].id
          : 0
        : 0;
      variableList.push({
        id: id + 1,
        name: '',
        value: '',
      });
    }

    noticyChange();
    forceUpdate();
  };
  const handleVariableDelete = index => {
    console.log(variableList);
    variableList.splice(index, 1);
    noticyChange();
    forceUpdate();
  };
  if (variableList === null || !Array.isArray(variableList)) return null;

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
              // event.emit('refreshVariable');
            }}
          />
        )}
      </div>
      <div className="variablePanel-container">
        <span>变量名</span>
        <span>{label === '输出参数' ? '描述' : '值'}</span>
        <span></span>
        {(variableList || []).map((varibale, index) => {
          return (
            <Fragment key={index}>
              <Input
                placeholder="变量"
                value={varibale.name}
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
                  synchroGraphDataToProcessTree();
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
                    synchroGraphDataToProcessTree();
                    handleEmitCodeTransform && handleEmitCodeTransform();
                  }}
                />
              )}
              {disabled ? (
                <span></span>
              ) : (
                <Icon
                  type="delete"
                  className="variablePanel-btn variablePanel-btn__delete"
                  onClick={() => {
                    console.log('ooo');
                    handleVariableDelete(index);
                    synchroGraphDataToProcessTree();
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
