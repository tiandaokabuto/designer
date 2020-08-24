import React, { useEffect, useState, memo, useMemo } from 'react';
import { useInjectContext } from 'react-hook-easier/lib/useInjectContext';
import { Button, Icon } from 'antd';
import './DebugBtn.less';

export default useInjectContext(({ labelText, iconType, click, disabled }) => {
  return (
    <div
      className={
        disabled ? 'outputPanel-debug-btn-disabled' : 'outputPanel-debug-btn'
      }
      onClick={click}
    >
      <Icon type={iconType} spin={iconType === 'loading' ? true : false} />
      {` `}
      {labelText}
    </div>
  );
});
