import React from 'react';
import { Button, Upload, Icon } from 'antd';

export default ({ type = 'default', desc, i }) => {
  return (
    <Upload disabled>
      <Button type={type} data-id={i} className="interactive-handler">
        <Icon type="upload" />
        {desc.label}
      </Button>
    </Upload>
  );
};
