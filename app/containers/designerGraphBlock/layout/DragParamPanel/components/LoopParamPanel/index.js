import React from 'react';
import { Input } from 'antd';

export default ({ param, onChange }) => {
  const stopDeleteKeyDown = e => {
    if (e.keyCode === 46) {
      e.nativeEvent.stopImmediatePropagation();
    }
  };

  return (
    <div className="parampanel-item">
      <span className="param-title" title={param.desc}>
        {param.cnName}
      </span>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Input
          value={param.value || param.default} // 可以加上 param.default 在参数面板显示默认值
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => stopDeleteKeyDown(e)}
        />
      </div>
    </div>
  );
};
