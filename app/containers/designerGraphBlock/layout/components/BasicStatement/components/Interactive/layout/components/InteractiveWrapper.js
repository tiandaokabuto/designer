import React from 'react';
import { Icon } from 'antd';

<<<<<<< HEAD
const Placeholder = ({ text }) => {
  return <div className="interactive-placeholder">新增{text}</div>;
};

export default ({ children, gridItem, handleControlDelete, text }) => {
  const isPlaceholder = gridItem.i.includes('preset');

=======
export default ({ children, gridItem, handleControlDelete }) => {
>>>>>>> fix:添加人机交互控件的删除功能
  return (
    <div
      className="interactive-wrapper"
      data-id={gridItem.i}
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      {isPlaceholder ? <Placeholder text={text} /> : children}
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
