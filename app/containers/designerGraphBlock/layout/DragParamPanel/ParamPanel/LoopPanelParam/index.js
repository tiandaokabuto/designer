import React, { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';

import LabelParam from '../components/LabelParam';
import ConditionParam from '../ConditionParam/index';

const LoopParam = ({
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
          id: 'listKeyword',
          enName: 'value',
          cnName: '值',
          value: '',
          default: '',
          paramType: ['String'],
        },
        {
          id: 'listArray',
          enName: 'arrayRet',
          cnName: '数组',
          value: '',
          default: '',
          paramType: ['List'],
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
          default: '',
          paramType: ['String'],
        },
        {
          id: 'dictValue',
          enName: 'value',
          cnName: '值',
          value: '',
          default: '',
          paramType: ['String'],
        },
        {
          id: 'dictVar',
          enName: 'dictVar',
          cnName: '字典',
          value: '',
          default: '',
          paramType: ['Dictionary'],
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
          default: '',
          paramType: ['String'],
        },
        {
          id: 'timeStartIndex',
          enName: 'startIndex',
          cnName: '初始值',
          value: '',
          default: '',
          paramType: ['String'],
        },
        {
          id: 'timeEndIndex',
          enName: 'endIndex',
          cnName: '结束值',
          value: '',
          default: '',
          paramType: ['String'],
        },
        {
          id: 'timeStep',
          enName: 'step',
          cnName: '每次增加',
          value: '',
          default: '',
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
            <LabelParam
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
LoopParam.propTypes = {
  param: PropTypes.object.isRequired,
  keyFlag: PropTypes.bool.isRequired,
  setFlag: PropTypes.func.isRequired,
  cards: PropTypes.array,
  handleEmitCodeTransform: PropTypes.func,
  stopDeleteKeyDown: PropTypes.func,
  loopSelect: PropTypes.string,
  aiHintList: PropTypes.object,
  appendDataSource: PropTypes.array,
  handleValidate: PropTypes.func,
};
LoopParam.defaultProps = {
  handleEmitCodeTransform: () => {},
  stopDeleteKeyDown: () => {},
  loopSelect: 'for_list',
  aiHintList: {},
  appendDataSource: [],
  handleValidate: () => {},
  cards: [],
};

export default LoopParam;
