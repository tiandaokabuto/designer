import React from 'react';
import { Icon } from 'antd';
<<<<<<< HEAD

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> fix:新增人机交互添加的相关逻辑
const Placeholder = ({ text }) => {
  return <div className="interactive-placeholder">新增{text}</div>;
};

export default ({ children, gridItem, handleControlDelete, text }) => {
  const isPlaceholder = gridItem.i.includes('preset');

<<<<<<< HEAD
=======
export default ({ children, gridItem, handleControlDelete }) => {
>>>>>>> fix:添加人机交互控件的删除功能
=======
>>>>>>> fix:新增人机交互添加的相关逻辑
=======

const Placeholder = ({ text }) => {
  return <div className="interactive-placeholder">新增{text}</div>;
};

export default ({ children, gridItem, handleControlDelete, text }) => {
  const isPlaceholder = gridItem.i.includes('preset');

>>>>>>> bcdb5fb4f093d9e583a5405716e0f59cb4bf4155
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
