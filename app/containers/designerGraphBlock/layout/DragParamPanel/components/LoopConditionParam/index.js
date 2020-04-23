import React, { Fragment, useState, useEffect } from 'react';
import { Input } from 'antd';

import LoopParamPanel from '../LoopParamPanel/index';
import event from '../../../eventCenter';
import ConditionParam from '../ConditionParam';

export default ({
  param,
  handleEmitCodeTransform,
  cards,
  stopDeleteKeyDown,
  keyFlag,
  setFlag,
  loopSelect,
}) => {
  const for_list = [
    {
      id: 'listKeyword',
      enName: 'value',
      cnName: '值',
      value: '',
    },
    {
      id: 'listArray',
      enName: 'arrayRet',
      cnName: '数组',
      value: '',
    },
  ];
  const for_dict = [
    {
      id: 'dictKey',
      enName: 'key',
      cnName: '键',
      value: '',
    },
    {
      id: 'dictValue',
      enName: 'value',
      cnName: '值',
      value: '',
    },
    {
      id: 'dictVar',
      enName: 'dictVar',
      cnName: '字典',
      value: '',
    },
  ];
  const for_times = [
    {
      id: 'timeIndex',
      enName: 'index',
      cnName: '索引名称',
      value: '',
    },
    {
      id: 'timeStartIndex',
      enName: 'startIndex',
      cnName: '初始值',
      value: '',
    },
    {
      id: 'timeEndIndex',
      enName: 'endIndex',
      cnName: '结束值',
      value: '',
    },
    {
      id: 'timeStep',
      enName: 'step',
      cnName: '每次增加',
      value: '',
    },
  ];

  useEffect(() => {
    if (!Array.isArray(param.for_list)) {
      param.for_list = for_list;
    }
    if (!Array.isArray(param.for_dict)) {
      param.for_dict = for_dict;
    }
    if (!Array.isArray(param.for_times)) {
      param.for_times = for_times;
    }
  });

  if (loopSelect === 'for_condition') {
    return (
      <ConditionParam
        param={param}
        cards={cards}
        handleEmitCodeTransform={handleEmitCodeTransform}
        stopDeleteKeyDown={stopDeleteKeyDown}
        keyFlag={keyFlag}
        setFlag={setFlag}
      />
    );
  }

  return (
    <Fragment>
      {param[loopSelect]
        ? param[loopSelect].map(item => (
            <LoopParamPanel
              param={{ ...param, cnName: item.cnName, value: item.value }}
              key={item.id}
              onChange={value => {
                item.value = value;
                if (param.listeners) {
                  param.listeners.forEach(callback => {
                    if (typeof callback === 'function') {
                      callback(value);
                    }
                  });
                }
                param.forceUpdate = param.forceUpdate + 1;
              }}
            />
          ))
        : null}
    </Fragment>
  );
};
