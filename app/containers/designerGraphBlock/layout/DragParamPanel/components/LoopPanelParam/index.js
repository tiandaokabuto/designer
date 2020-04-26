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
  aiHintList,
  appendDataSource,
  handleValidate,
}) => {
  // 数据初始化
  useEffect(() => {
    if (!Array.isArray(param.for_list)) {
      param.for_list = [
        {
          ...param,
          id: 'listKeyword',
          enName: 'value',
          cnName: '值',
          value: '',
          paramType: ['String'],
        },
        {
          ...param,
          id: 'listArray',
          enName: 'arrayRet',
          cnName: '数组',
          value: '',
          paramType: ['List'],
        },
      ];
    }
    if (!Array.isArray(param.for_dict)) {
      param.for_dict = [
        {
          ...param,
          id: 'dictKey',
          enName: 'key',
          cnName: '键',
          value: '',
          paramType: ['String'],
        },
        {
          ...param,
          id: 'dictValue',
          enName: 'value',
          cnName: '值',
          value: '',
          paramType: ['String'],
        },
        {
          ...param,
          id: 'dictVar',
          enName: 'dictVar',
          cnName: '字典',
          value: '',
          paramType: ['Dictionary'],
        },
      ];
    }
    if (!Array.isArray(param.for_times)) {
      param.for_times = [
        {
          ...param,
          id: 'timeIndex',
          enName: 'index',
          cnName: '索引名称',
          value: '',
          paramType: ['String'],
        },
        {
          ...param,
          id: 'timeStartIndex',
          enName: 'startIndex',
          cnName: '初始值',
          value: '',
          paramType: ['String'],
        },
        {
          ...param,
          id: 'timeEndIndex',
          enName: 'endIndex',
          cnName: '结束值',
          value: '',
          paramType: ['String'],
        },
        {
          ...param,
          id: 'timeStep',
          enName: 'step',
          cnName: '每次增加',
          value: '',
          paramType: ['String'],
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
              param={item}
              aiHintList={aiHintList}
              appendDataSource={appendDataSource}
              handleEmitCodeTransform={() => handleEmitCodeTransform(cards)}
              handleValidate={handleValidate}
              keyFlag={keyFlag}
              key={item.id}
              onChange={() => {
                param.forceUpdate = param.forceUpdate + 1;
              }}
            />
          ))
        : null}
    </Fragment>
  );
};
