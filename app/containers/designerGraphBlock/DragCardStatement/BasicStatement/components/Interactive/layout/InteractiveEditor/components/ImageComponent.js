import React from 'react';
import { Skeleton } from 'antd';

import Placeholder from '../../../../../../../../assets/images/pvc_placeholer.png';

export default ({ desc, i }) => {
  return (
    <div className="interactive-handler interactive-image" data-id={i}>
      {/* <img
        data-id={i}
        src={Placeholder}
        alt="占位图片"
        style={{
          width: '100%',
        }}
      /> */}
    </div>
  );
};
