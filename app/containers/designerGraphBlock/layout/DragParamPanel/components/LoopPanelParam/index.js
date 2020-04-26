import React, { Fragment, useEffect } from 'react';
import { Input } from 'antd';

import LoopParam from './LoopParam';
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
  // 数据初始化
  useEffect(() => {
    if (!Array.isArray(param.for_list)) {
      param.for_list = [
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
    }
    if (!Array.isArray(param.for_dict)) {
      param.for_dict = [
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
    }
    if (!Array.isArray(param.for_times)) {
      param.for_times = [
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
    }
  }, []);

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
            <LoopParam
              param={{ ...param, cnName: item.cnName, value: item.value }}
              key={item.id}
              onChange={value => {
                item.value = value;
                handleEmitCodeTransform(cards);
                param.forceUpdate = param.forceUpdate + 1;
              }}
            />
          ))
        : null}
    </Fragment>
  );
};
