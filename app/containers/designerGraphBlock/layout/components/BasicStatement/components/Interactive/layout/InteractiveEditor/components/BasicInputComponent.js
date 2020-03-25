import React from 'react';
import { Input, Icon } from 'antd';

export default ({ desc, i }) => {
  return (
    <div className="interactive-input">
      <div className="interactive-handler" data-id={i}>
        {desc.label}
      </div>
      {desc.password === 'true' ? (
        <Input.Password value={desc.value} />
      ) : (
        <Input value={desc.value} />
      )}
    </div>
  );
};
