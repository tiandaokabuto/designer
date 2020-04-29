import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import usePersistentStorage from '../../../../common/DragEditorHeader/useHooks/usePersistentStorage';
import usePersistentModuleStorage from '../../../../common/DragEditorHeader/useHooks/usePersistentModuleStorage';

import './ContextMenu.scss';

export default ({ position, handleDelete, handleRename }) => {
  const { left, top, node } = position;
  const [visible, setVisible] = useState(false);
  const isMount = useRef(false);

  const isProcess = node && node.type === 'process';
  const treeTab = useSelector(state => state.grapheditor.treeTab);
  const blockTreeTab = useSelector(state => state.blockcode.blockTreeTab);

  const persistentStorage = usePersistentStorage();
  const persistentModuleStorage = usePersistentModuleStorage();
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
    const rightPanel = document.querySelector('.rightclick-panel');

    document.addEventListener('click', handleClose);
    if (rightPanel) {
      rightPanel.addEventListener('mousedown', handleClose);
    }
    return () => {
      document.removeEventListener('click', handleClose);
      if (rightPanel) {
        rightPanel.removeEventListener('mousedown', handleClose);
      }
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
      {/* {isProcess && <div className="menuitem">运行此流程</div>} */}

      <div
        className="menuitem"
        onClick={() => {
          if (blockTreeTab === 'secondModule') {
            handleDelete(node.eventKey, persistentModuleStorage);
          } else {
            if (treeTab !== 'processModule') {
              handleDelete(node.eventKey, persistentStorage);
            } else {
              handleDelete(node.eventKey, persistentModuleStorage);
            }
          }
          setVisible(false);
        }}
      >
        删除
      </div>
      {/* {isProcess && <div className="menuitem">另存为</div>} */}

      <div
        className="menuitem"
        onClick={() => {
          if (blockTreeTab === 'secondModule') {
            handleRename(node.eventKey, persistentModuleStorage);
          } else {
            if (treeTab !== 'processModule') {
              handleRename(node.eventKey, persistentStorage);
            } else {
              handleRename(node.eventKey, persistentModuleStorage);
            }
          }
          setVisible(false);
        }}
      >
        重命名
      </div>
    </div>
  );
};
