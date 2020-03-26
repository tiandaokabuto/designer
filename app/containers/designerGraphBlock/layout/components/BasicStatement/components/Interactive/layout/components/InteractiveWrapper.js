import React from 'react';
import { Icon } from 'antd';

export default ({ children, gridItem, handleControlDelete }) => {
  return (
    <div
      className="interactive-wrapper"
      data-id={gridItem.i}
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      {children}
      <div className="interactive-wrapper-operation">
        <Icon type="drag" className="interactive-handler" />
        <Icon type="copy" />
        <Icon
          type="delete"
          onClick={() => {
            handleControlDelete(gridItem.i);
          }}
        />
      </div>
    </div>
  );
};
