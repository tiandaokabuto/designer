import React from 'react';
import { Input, Icon } from 'antd';

export default ({ desc, i }) => {
  return (
    <div>
      <div className="interactive-handler" data-id={i}>
        {desc.label}
      </div>
      <Input />
    </div>
  );
};
