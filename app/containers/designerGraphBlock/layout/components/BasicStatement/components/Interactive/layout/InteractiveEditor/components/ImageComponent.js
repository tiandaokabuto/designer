import React from 'react';
import { Skeleton } from 'antd';

export default ({ desc, i }) => {
  return (
    <div>
      <div className="interactive-handler" data-id={i}>
        {desc.label}
      </div>
      占位图片
    </div>
  );
};
