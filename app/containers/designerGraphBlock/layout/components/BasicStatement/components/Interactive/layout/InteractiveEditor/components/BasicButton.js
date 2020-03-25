import React from 'react';
import { Button } from 'antd';

export default ({ type = 'default', text }) => {
  return (
    <Button type={type} className="interactive-handler">
      {text}
    </Button>
  );
};
