import React from 'react';
import { useSelector } from 'react-redux';

import { ConfirmModal } from '../../../components';
import usePersistentStorage from '../../../common/DragEditorHeader/useHooks/usePersistentStorage';
import {
  changeModifyState,
  setAllModifiedState,
  traverseTree,
} from '_utils/utils';

export default function SaveConfirmModel({
  modalVisible,
  setModalVisible,
  type,
  modifiedNodes,
  onCancelOk,
  onOk,
}) {
  const processTree = useSelector(state => state.grapheditor.processTree);
  const persistentStorage = usePersistentStorage();
  const currentCheckedTreeNode = useSelector(
    state => state.grapheditor.currentCheckedTreeNode
  );

  return (
    <ConfirmModal
      visible={modalVisible}
      content="请确认是否保存?"
      onCancel={() => {
        setModalVisible(false);
      }}
      onCancelOk={() => {
        console.log(currentCheckedTreeNode);
        changeModifyState(processTree, currentCheckedTreeNode, false);
        const data = localStorage.getItem('temporaryData');
        console.log(JSON.parse(data));
        traverseTree(processTree, item => {
          if (item.key === currentCheckedTreeNode) {
            item.data = data ? JSON.parse(data) : item.data;
          }
        });
        if (onCancelOk) {
          onCancelOk();
        }
        setModalVisible(false);
      }}
      onOk={() => {
        if (type === 'saveOne') {
          changeModifyState(processTree, currentCheckedTreeNode, false); // 把hasmodified改成false
          persistentStorage(); // 保存currentCheckedTreeNode的内容
        } else if (type === 'saveAll') {
          setAllModifiedState(processTree); // 把所有已修改的状态改为false
          persistentStorage(undefined, modifiedNodes); // 保存当前正在修改的
        }
        if (onOk) {
          onOk();
        }
        setModalVisible(false); // 关闭对话框
      }}
    />
  );
}
