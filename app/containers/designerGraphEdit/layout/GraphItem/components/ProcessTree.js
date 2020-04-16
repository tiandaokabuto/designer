import React, { useState, useEffect } from 'react';
import { Tree, Modal, Icon } from 'antd';
import { useSelector } from 'react-redux';
import cloneDeep from 'lodash/cloneDeep';
import { ItemPanel, Item } from 'gg-editor';

import { ConfirmModal } from '../../../../common/components';
import {
  changeProcessTree,
  changeCheckedTreeNode,
  changeModuleTree,
  changeCheckedModuleTreeNode,
} from '../../../../reduxActions';
import {
  resetGraphEditData,
  changeMovingModuleNode,
} from '../../../../reduxActions';
import Switcher from './Switcher';
import ContextMenu from './ContextMenu';
import {
  deleteNodeByKey,
  renameNodeByKey,
  hasNodeModified,
  setAllModifiedState,
  setNodeModifiedState,
  traverseTree,
  persistentModuleStorage,
} from '../../../../common/utils';
import usePersistentStorage from '../../../../common/DragEditorHeader/useHooks/usePersistentStorage';
import usePersistentModuleStorage from '../../../../common/DragEditorHeader/useHooks/usePersistentModuleStorage';
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

const transformTreeTitle = (processTree, type) => {
  const result = cloneDeep(processTree);
  function recurise(tree) {
    for (const child of tree) {
      // 添加title
      if (child.type === 'process') {
        // child.hasModified = false;
        if (type === 'processModule') {
          child.title = (
            <div draggable={false}>
              <ItemPanel>
                <Item
                  type="node"
                  size="184*56"
                  shape="processblock"
                  icon="http://bpic.588ku.com/element_origin_min_pic/00/92/88/9056f24073c4c87.jpg"
                  model={{
                    color: '#1890FF',
                    label: child.title,
                    style: {
                      stroke: 'rgba(61, 109, 204, 1)',
                      fill: '#ecf5f6',
                    },
                  }}
                >
                  <TreeNodeTitle
                    title={child.title}
                    hasModified={child.hasModified}
                    type="cluster"
                  />
                </Item>
              </ItemPanel>
            </div>
          );
        } else {
          child.title = (
            <TreeNodeTitle
              title={child.title}
              hasModified={child.hasModified}
              type="cluster"
            />
          );
        }
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

export default ({ type }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedKey, setSelectedKey] = useState('');
  const [expandedKeys, setExpandedKeys] = useState([]);
  const processTree = useSelector(state => state.grapheditor.processTree);
  const moduleTree = useSelector(state => state.grapheditor.moduleTree);
  const currentCheckedTreeNode = useSelector(
    state => state.grapheditor.currentCheckedTreeNode
  );
  const currentCheckedModuleTreeNode = useSelector(
    state => state.grapheditor.currentCheckedModuleTreeNode
  );
  const currentProject = useSelector(state => state.grapheditor.currentProject);

  const persistentStorage = usePersistentStorage();
  const persistentModuleStorage = usePersistentModuleStorage();

  // 右键菜单位置设定
  const [position, setPosition] = useState({});
  const onDragEnter = info => {
    console.log(info);
    // expandedKeys 需要受控时设置
    // this.setState({
    //   expandedKeys: info.expandedKeys,
    // });
  };

  const onDragStart = info => {
    const dragKey = info.node.props.eventKey;
    traverseTree(moduleTree, item => {
      if (item.key === dragKey) {
        changeMovingModuleNode(item);
      }
    });
  };

  const onDrop = info => {
    console.log(info);
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
    if (type === 'process') {
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
    } else {
      const data = [...moduleTree];
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
          changeModuleTree(data);
        }
      });
      persistentModuleStorage(
        data,
        currentProject,
        currentCheckedModuleTreeNode
      );
    }
  };

  const handleDelete = (key, persistentStorage) => {
    if (type === 'process') {
      Modal.confirm({
        content: '请确认是否删除?',
        onOk() {
          deleteNodeByKey(type, processTree, currentProject, key);
          changeProcessTree([...processTree]);
          resetGraphEditData();
          persistentStorage();
        },
      });
    } else {
      Modal.confirm({
        content: '请确认是否删除?',
        onOk() {
          deleteNodeByKey(type, moduleTree, currentProject, key);
          changeCheckedModuleTreeNode(undefined);
          changeModuleTree([...moduleTree]);
          // resetGraphEditData();
          persistentStorage();
        },
      });
    }
  };

  const handleRename = (key, persistentStorage) => {
    if (type === 'process') {
      const restoreCheckedTreeNode = () => {
        changeCheckedTreeNode(currentCheckedTreeNode);
      };
      changeCheckedTreeNode(undefined);
      renameNodeByKey(
        cloneDeep(processTree),
        key,
        persistentStorage,
        restoreCheckedTreeNode,
        currentProject,
        type
      );
    } else {
      const restoreCheckedTreeNode = () => {
        changeCheckedModuleTreeNode(currentCheckedModuleTreeNode);
      };
      changeCheckedModuleTreeNode(undefined);
      renameNodeByKey(
        cloneDeep(moduleTree),
        key,
        persistentStorage,
        restoreCheckedTreeNode,
        currentProject,
        type
      );
    }
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
    <div
      style={{
        height: 'calc(100vh - 150px)',
      }}
    >
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
        onDragStart={onDragStart}
        //treeData={processTree}
        treeData={
          type === 'process'
            ? transformTreeTitle(processTree, type)
            : transformTreeTitle(moduleTree, type)
        }
        selectedKeys={
          type === 'process'
            ? [currentCheckedTreeNode]
            : [currentCheckedModuleTreeNode]
        }
        onSelect={(selectedKey, e) => {
          if (type === 'process') {
            if (currentCheckedTreeNode === undefined) {
              // 首次打开时currentCheckedTreeNode为undefined
              setSelectedKey(selectedKey[0]);
              changeCheckedTreeNode(selectedKey[0]);
            } else {
              // 选择自身以外的其他节点
              if (selectedKey.length !== 0) {
                const isModified = hasNodeModified(
                  processTree,
                  currentCheckedTreeNode
                );
                // 当前选中节点是否有更改
                if (isModified) {
                  setSelectedKey(selectedKey[0]);
                  setModalVisible(true); // 提示保存
                } else {
                  setSelectedKey(selectedKey[0]);
                  changeCheckedTreeNode(selectedKey[0]);
                }
              }
            }
          } else {
            if (currentCheckedModuleTreeNode === undefined) {
              setSelectedKey(selectedKey[0]);
              changeCheckedModuleTreeNode(selectedKey[0]);
            } else {
              if (selectedKey.length !== 0) {
                setSelectedKey(selectedKey[0]);
                changeCheckedModuleTreeNode(selectedKey[0]);
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

  // return type === 'process' ? (
  //   <div
  //     style={{
  //       height: '50vh',
  //     }}
  //   >
  //     <Tree
  //       className="draggable-tree"
  //       expandedKeys={expandedKeys}
  //       defaultExpandAll={true}
  //       switcherIcon={<Switcher />}
  //       showIcon={true}
  //       draggable
  //       blockNode
  //       onExpand={expandKeys => {
  //         setExpandedKeys(expandKeys);
  //       }}
  //       onRightClick={({ event, node }) => {
  //         setPosition({
  //           left: event.pageX + 40,
  //           top: event.pageY - 20,
  //           node: node.props,
  //         });
  //       }}
  //       onDragEnter={onDragEnter}
  //       onDrop={onDrop}
  //       //treeData={processTree}
  //       treeData={transformTreeTitle(processTree, type)}
  //       selectedKeys={[currentCheckedTreeNode]}
  //       onSelect={(selectedKey, e) => {
  //         if (currentCheckedTreeNode === undefined) {
  //           setSelectedKey(selectedKey[0]);
  //           changeCheckedTreeNode(selectedKey[0]);
  //         } else {
  //           if (selectedKey.length !== 0) {
  //             const isModified = hasNodeModified(
  //               processTree,
  //               currentCheckedTreeNode
  //             );
  //             if (isModified) {
  //               // 有更改
  //               setSelectedKey(selectedKey[0]);
  //               setModalVisible(true);
  //             } else {
  //               setSelectedKey(selectedKey[0]);
  //               changeCheckedTreeNode(selectedKey[0]);
  //             }
  //           }
  //         }
  //       }}
  //     />
  //     <ContextMenu
  //       position={position}
  //       handleDelete={handleDelete}
  //       handleRename={handleRename}
  //     />
  //     <ConfirmModal
  //       visible={modalVisible}
  //       content="请确认是否保存?"
  //       onCancel={() => {
  //         setModalVisible(false);
  //       }}
  //       onCancelOk={() => {
  //         resetGraphEditData();
  //         changeCheckedTreeNode(selectedKey);
  //         setModalVisible(false);
  //       }}
  //       onOk={() => {
  //         setNodeModifiedState(processTree, currentCheckedTreeNode); // 把hasmodified改成false
  //         persistentStorage(); // 保存currentCheckedTreeNode的内容
  //         resetGraphEditData(); // 重设GraphEditData
  //         changeCheckedTreeNode(selectedKey); // 修改当前选中
  //         setModalVisible(false); // 关闭对话框
  //       }}
  //     />
  //   </div>
  // ) : (
  //   <div
  //     style={{
  //       height: '50vh',
  //     }}
  //   >
  //     {/* <ItemPanel> */}
  //     <Tree
  //       className="draggable-tree"
  //       expandedKeys={expandedKeys}
  //       defaultExpandAll={true}
  //       switcherIcon={<Switcher />}
  //       showIcon={true}
  //       draggable
  //       blockNode
  //       onExpand={expandKeys => {
  //         setExpandedKeys(expandKeys);
  //       }}
  //       onRightClick={({ event, node }) => {
  //         setPosition({
  //           left: event.pageX + 40,
  //           top: event.pageY - 20,
  //           node: node.props,
  //         });
  //       }}
  //       onDragStart={onDragStart}
  //       onDragEnter={onDragEnter}
  //       onDrop={onDrop}
  //       //treeData={processTree}
  //       treeData={transformTreeTitle(moduleTree, type)}
  //       selectedKeys={[currentCheckedModuleTreeNode]}
  //       onSelect={(selectedKey, e) => {
  //         if (currentCheckedModuleTreeNode === undefined) {
  //           setSelectedKey(selectedKey[0]);
  //           changeCheckedModuleTreeNode(selectedKey[0]);
  //         } else {
  //           if (selectedKey.length !== 0) {
  //             setSelectedKey(selectedKey[0]);
  //             changeCheckedModuleTreeNode(selectedKey[0]);
  //           }
  //         }
  //       }}
  //     />
  //     {/* </ItemPanel> */}
  //     <ContextMenu
  //       position={position}
  //       handleDelete={handleDelete}
  //       handleRename={handleRename}
  //     />
  //     <ConfirmModal
  //       visible={modalVisible}
  //       content="请确认是否保存?"
  //       onCancel={() => {
  //         setModalVisible(false);
  //       }}
  //       onCancelOk={() => {
  //         resetGraphEditData();
  //         changeCheckedTreeNode(selectedKey);
  //         setModalVisible(false);
  //       }}
  //       onOk={() => {
  //         setNodeModifiedState(processTree, currentCheckedTreeNode); // 把hasmodified改成false
  //         persistentStorage(); // 保存currentCheckedTreeNode的内容
  //         resetGraphEditData(); // 重设GraphEditData
  //         changeCheckedTreeNode(selectedKey); // 修改当前选中
  //         setModalVisible(false); // 关闭对话框
  //       }}
  //     />
  //   </div>
  // );
};
