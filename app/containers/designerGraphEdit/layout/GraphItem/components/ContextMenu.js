import React, { useState, useEffect, useRef } from 'react';
import usePersistentStorage from '../../../../common/DragEditorHeader/useHooks/usePersistentStorage';

import './ContextMenu.scss';

export default ({ position, handleDelete, handleRename }) => {
  const { left, top, node } = position;
  const [visible, setVisible] = useState(false);
  const isMount = useRef(false);

  const isProcess = node && node.type === 'process';

  const persistentStorage = usePersistentStorage();
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
      {isProcess && <div className="menuitem">运行此流程</div>}

      <div
        className="menuitem"
        onClick={() => {
          handleDelete(node.eventKey, persistentStorage);
          setVisible(false);
        }}
      >
        删除
      </div>
      {isProcess && <div className="menuitem">另存为</div>}

      <div
        className="menuitem"
        onClick={() => {
          handleRename(node.eventKey, persistentStorage);
          setVisible(false);
        }}
      >
        重命名
      </div>
    </div>
  );
};
