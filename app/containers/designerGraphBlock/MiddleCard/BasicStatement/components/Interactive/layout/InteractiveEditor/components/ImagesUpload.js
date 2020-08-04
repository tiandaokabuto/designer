import React from 'react';
import { Skeleton } from 'antd';

import Placeholder from '../../../../../../../../assets/images/pvc_most.png';

export default ({ desc, i }) => {
  return (
    <div className="interactive-handler interactive-images" data-id={i}>
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
