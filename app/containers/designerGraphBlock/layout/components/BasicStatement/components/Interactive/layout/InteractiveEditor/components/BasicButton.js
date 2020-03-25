import React from 'react';
import { Button } from 'antd';

export default ({ type = 'default', desc, i }) => {
  return (
    <Button type={type} data-id={i} className="interactive-handler">
      {desc.label}
    </Button>
  );
};
