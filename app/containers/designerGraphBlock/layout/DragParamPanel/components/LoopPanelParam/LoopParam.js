import React from 'react';
import { Input } from 'antd';

import AutoCompleteInputParam from '../AutoCompleteInputParam';

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
    <div className="parampanel-item">
      <span className="param-title" title={param.desc}>
        {param.cnName}
      </span>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <AutoCompleteInputParam
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
