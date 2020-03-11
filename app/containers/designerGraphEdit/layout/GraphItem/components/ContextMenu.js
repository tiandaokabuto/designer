import React, { useState, useEffect, useRef } from 'react';

import './ContextMenu.scss';

export default ({ position, handleDelete }) => {
  const { left, top, node } = position;
  const [visible, setVisible] = useState(false);
  const isMount = useRef(false);
  useEffect(() => {
    if (!isMount.current) {
      isMount.current = true;
      return;
    }
    setVisible(true);

    const handleClose = e => {
      const canClose = contextMenu.contains(e.target);
      if (!canClose) {
        setVisible(false);
      }
    };

    const contextMenu = document.querySelector('.rightClickMenu');

    document.addEventListener('click', handleClose);
    return () => {
      document.removeEventListener('click', handleClose);
    };
  }, [left, top]);
  return (
    <div
      className="rightClickMenu"
      style={{
        position: 'fixed',
        visibility: visible ? 'visible' : 'hidden',
        left: left,
        top: top,
      }}
    >
      <div>运行此流程</div>
      <div
        onClick={() => {
          handleDelete(node.eventKey);
          setVisible(false);
        }}
      >
        删除
      </div>
      <div>另存为</div>
    </div>
  );
};