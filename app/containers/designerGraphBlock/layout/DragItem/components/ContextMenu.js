import React, { useState, useEffect, useRef } from 'react';

import './ContextMenu.scss';

export default ({
  position,
  addToLovedList,
  removeFromLovedList,
  handleRename,
}) => {
  const { left, top, node } = position;
  const [visible, setVisible] = useState(false);
  const isMount = useRef(false);

  const isProcess = node && node.type === 'process';

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
        zIndex: 1,
        top: top,
      }}
    >
      {isProcess && <div className="menuitem">运行此流程</div>}
      <div
        className="menuitem"
        onClick={() => {
          if (node.loved) {
            removeFromLovedList(node.eventKey);
          } else {
            addToLovedList(node.eventKey);
          }

          setVisible(false);
        }}
      >
        {node.loved ? '从收藏中移除' : '添加到收藏'}
      </div>
      {isProcess && <div className="menuitem">另存为</div>}
    </div>
  );
};
