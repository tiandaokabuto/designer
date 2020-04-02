import React, { useState, useEffect } from 'react';
import { Tree, Modal, Icon } from 'antd';
import { useSelector } from 'react-redux';
import cloneDeep from 'lodash/cloneDeep';

import { ConfirmModal } from '../../../../common/components';
import {
  changeProcessTree,
  changeCheckedTreeNode,
} from '../../../../reduxActions';
import { resetGraphEditData } from '../../../../reduxActions';
import Switcher from './Switcher';
import ContextMenu from './ContextMenu';
import {
  deleteNodeByKey,
  renameNodeByKey,
  hasNodeModified,
  setAllModifiedState,
  setNodeModifiedState,
  traverseTree,
} from '../../../../common/utils';
import usePersistentStorage from '../../../../common/DragEditorHeader/useHooks/usePersistentStorage';
import { fromTextArea } from 'codemirror';
import event from '../../../../designerGraphBlock/layout/eventCenter';

const TreeNodeTitle = ({ title, type, hasModified }) => {
  return (
    <div className="treenode-title">
      <Icon type={type} style={{ marginRight: 8, marginLeft: 12 }} />
      {title}
      <span
        style={{
          visibility: hasModified ? 'visible' : 'hidden',
          verticalAlign: 'sub',
          display: 'inline-block',
          marginLeft: 8,
          color: hasModified ? 'red' : '',
        }}
        className={hasModified ? 'hasModified' : 'notModified'}
      >
        *
      </span>
    </div>
  );
};

const transformTreeTitle = processTree => {
  const result = cloneDeep(processTree);
  function recurise(tree) {
    for (const child of tree) {
      // 添加title
      if (child.type === 'process') {
        // child.hasModified = false;
        child.title = (
          <TreeNodeTitle
            title={child.title}
            hasModified={child.hasModified}
            type="cluster"
          />
        );
      } else {
        // child.hasModified = false;
        child.title = (
          <TreeNodeTitle
            title={child.title}
            hasModified={child.hasModified}
            type="file"
          />
        );
      }
      if (child.children) {
        recurise(child.children);
      }
    }
  }
  recurise(result);
  return result;
};

export default () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedKey, setSelectedKey] = useState('');
  const [expandedKeys, setExpandedKeys] = useState([]);
  const processTree = useSelector(state => state.grapheditor.processTree);
  const currentCheckedTreeNode = useSelector(
    state => state.grapheditor.currentCheckedTreeNode
  );
  const currentProject = useSelector(state => state.grapheditor.currentProject);

  const persistentStorage = usePersistentStorage();

  // 右键菜单位置设定
  const [position, setPosition] = useState({});
  const onDragEnter = info => {
    // expandedKeys 需要受控时设置
    // this.setState({
    //   expandedKeys: info.expandedKeys,
    // });
  };

  const onDrop = info => {
    const dropKey = info.node.props.eventKey; // 释放的元素
    const dragKey = info.dragNode.props.eventKey; // 拖动的元素
    const dropPos = info.node.props.pos.split('-'); //
    const dropPosition =
      info.dropPosition - Number(dropPos[dropPos.length - 1]); // 位置
    const loop = (data, key, callback) => {
      data.forEach((item, index, arr) => {
        if (item.key === key) {
          return callback(item, index, arr);
        }
        if (item.children) {
          return loop(item.children, key, callback);
        }
      });
    };
    const data = [...processTree];

    traverseTree(data, item => {
      if (item.key === dropKey && item.type === 'dir') {
        // Find dragObject
        let dragObj;
        loop(data, dragKey, (item, index, arr) => {
          arr.splice(index, 1);
          dragObj = item;
        });

        if (!info.dropToGap) {
          // Drop on the content
          loop(data, dropKey, item => {
            item.children = item.children || [];
            // where to insert 示例添加到尾部，可以是随意位置
            item.children.push(dragObj);
          });
        } else if (
          (info.node.props.children || []).length > 0 && // Has children
          info.node.props.expanded && // Is expanded
          dropPosition === 1 // On the bottom gap
        ) {
          loop(data, dropKey, item => {
            item.children = item.children || [];
            // where to insert 示例添加到头部，可以是随意位置
            item.children.unshift(dragObj);
          });
        } else {
          let ar;
          let i;
          loop(data, dropKey, (item, index, arr) => {
            ar = arr;
            i = index;
          });
          if (dropPosition === -1) {
            ar.splice(i, 0, dragObj);
          } else {
            ar.splice(i + 1, 0, dragObj);
          }
        }
        changeProcessTree(data);
      }
    });
    persistentStorage();
  };

  const handleDelete = (key, persistentStorage) => {
    Modal.confirm({
      content: '请确认是否删除?',
      onOk() {
        deleteNodeByKey(processTree, currentProject, key);
        changeProcessTree([...processTree]);
        resetGraphEditData();
        persistentStorage();
      },
    });
  };

  const handleRename = (key, persistentStorage) => {
    const restoreCheckedTreeNode = () => {
      changeCheckedTreeNode(currentCheckedTreeNode);
    };
    changeCheckedTreeNode(undefined);
    renameNodeByKey(
      cloneDeep(processTree),
      key,
      persistentStorage,
      restoreCheckedTreeNode,
      currentProject
    );
  };

  useEffect(() => {
    const handleAddExpanedKeys = keys => {
      setExpandedKeys(expandedKeys => {
        if (expandedKeys.includes(keys)) return expandedKeys;
        return expandedKeys.concat(keys);
      });
    };
    event.addListener('expandKeys', handleAddExpanedKeys);
    return () => {
      event.removeListener('expandKeys', handleAddExpanedKeys);
    };
  }, [setExpandedKeys]);

  return (
    <div>
      <Tree
        className="draggable-tree"
        expandedKeys={expandedKeys}
        defaultExpandAll={true}
        switcherIcon={<Switcher />}
        showIcon={true}
        draggable
        blockNode
        onExpand={expandKeys => {
          setExpandedKeys(expandKeys);
        }}
        onRightClick={({ event, node }) => {
          setPosition({
            left: event.pageX + 40,
            top: event.pageY - 20,
            node: node.props,
          });
        }}
        onDragEnter={onDragEnter}
        onDrop={onDrop}
        //treeData={processTree}
        treeData={transformTreeTitle(processTree)}
        selectedKeys={[currentCheckedTreeNode]}
        onSelect={(selectedKey, e) => {
          if (currentCheckedTreeNode === undefined) {
            setSelectedKey(selectedKey[0]);
            changeCheckedTreeNode(selectedKey[0]);
          } else {
            if (selectedKey.length !== 0) {
              const isModified = hasNodeModified(
                processTree,
                currentCheckedTreeNode
              );
              if (isModified) {
                // 有更改
                setSelectedKey(selectedKey[0]);
                setModalVisible(true);
              } else {
                setSelectedKey(selectedKey[0]);
                changeCheckedTreeNode(selectedKey[0]);
              }
            }
          }
        }}
      />
      <ContextMenu
        position={position}
        handleDelete={handleDelete}
        handleRename={handleRename}
      />
      <ConfirmModal
        visible={modalVisible}
        content="请确认是否保存?"
        onCancel={() => {
          setModalVisible(false);
        }}
        onCancelOk={() => {
          resetGraphEditData();
          changeCheckedTreeNode(selectedKey);
          setModalVisible(false);
        }}
        onOk={() => {
          setNodeModifiedState(processTree, currentCheckedTreeNode); // 把hasmodified改成false
          persistentStorage(); // 保存currentCheckedTreeNode的内容
          resetGraphEditData(); // 重设GraphEditData
          changeCheckedTreeNode(selectedKey); // 修改当前选中
          setModalVisible(false); // 关闭对话框
        }}
      />
    </div>
  );
};
