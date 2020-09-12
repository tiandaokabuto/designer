import React from 'react';

import AutoCompletePlusParam from './AutoCompletePlusParam';

export default ({
  param,
  onChange,
  aiHintList,
  appendDataSource,
  keyFlag,
  handleEmitCodeTransform,
  handleValidate,
}) => {
  return (
    <div className="parampanel-item param-item">
      <span className="param-title" title={param.desc}>
        {param.cnName}
      </span>
      <div className="param-item-wrapper">
        <AutoCompletePlusParam
          param={param}
          aiHintList={aiHintList}
          appendDataSource={appendDataSource}
          keyFlag={keyFlag}
          handleEmitCodeTransform={handleEmitCodeTransform}
          handleValidate={handleValidate}
          onChange={onChange}
        />
      </div>
    </div>
  );
};
