import React, { useState, useEffect } from 'react';
import { Tree, Modal, Icon, Dropdown, Menu, message, Tooltip } from 'antd';
import { useSelector } from 'react-redux';
import cloneDeep from 'lodash/cloneDeep';
import { ItemPanel, Item } from 'gg-editor';

import DragCard from '../../../designerGraphBlock/DragItem/components/DragCard';
import {
  changeProcessTree,
  changeCheckedTreeNode,
  changeModuleTree,
  changeCheckedModuleTreeNode,
  resetGraphEditData,
  changeMovingModuleNode,
} from '../../../reduxActions';

import Switcher from './Switcher';
import ContextMenu from './ContextMenu';
import {
  deleteNodeByKey,
  renameNodeByKey,
  hasNodeModified,
  traverseTree,
  getChooseFilePath,
  getProjectTreeData,
  findNodeByKey,
  getDecryptOrNormal,
} from '_utils/utils';
import event from '@/containers/eventCenter';
import usePersistentStorage from '../../../common/DragEditorHeader/useHooks/usePersistentStorage';
import usePersistentModuleStorage from '../../../common/DragEditorHeader/useHooks/usePersistentModuleStorage';
import SaveConfirmModel from './SaveConfirmModel';
import { info } from 'electron-log';
import mxgraph from '../../MxGraph/mxgraph';

const { ipcRenderer } = require('electron');

const { mxCell: MxCell, mxGeometry: MxGeometry } = mxgraph;

const TreeNodeTitle = ({
  title,
  iconType,
  hasModified,
  node,
  type,
  currentProject,
  dragModule,
}) => {
  return (
    <div
      className={`${
        dragModule ? 'treenode-title process-module-drag' : 'treenode-title'
      }`}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      <Icon
        type={iconType}
        style={{
          marginRight: 8,
          marginLeft: 12,
          display: 'flex',
          alignItems: 'center',
        }}
      />
      {type === 'secondModule' && node.type === 'process' ? (
        <DragCard
          title={title}
          node={node}
          item={node}
          tabType={type}
          currentProject={currentProject}
        />
      ) : (
        // <Tooltip placement="right" title={title}>
        <div
          style={{
            flexBasis: 150,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </div>
        // </Tooltip>
      )}

      <span
        style={{
          visibility: hasModified ? 'visible' : 'hidden',
          verticalAlign: 'sub',
          display: 'inline-block',
          marginRight: 4,
          color: hasModified ? 'rgba(204,204,204,1)' : '',
        }}
        className={hasModified ? 'hasModified' : 'notModified'}
      >
        (未保存)
      </span>
    </div>
  );
};

const transformTreeTitle = (
  processTree,
  type,
  currentProject,
  blockTreeTab,
  createItem
) => {
  const result = cloneDeep(processTree);
  function recurise(tree) {
    for (const child of tree) {
      // 添加title
      if (child.type === 'process') {
        // child.hasModified = false;
        if (type === 'processModule') {
          child.title = (
            <TreeNodeTitle
              node={child}
              title={child.title}
              hasModified={child.hasModified}
              iconType="cluster"
              type={blockTreeTab}
              currentProject={currentProject}
              dragModule={true}
            />
          );
        } else {
          child.title = (
            <TreeNodeTitle
              node={child}
              title={child.title}
              hasModified={child.hasModified}
              iconType="cluster"
              type={blockTreeTab}
              currentProject={currentProject}
            />
          );
        }
      } else {
        // child.hasModified = false;
        child.title = (
          <TreeNodeTitle
            node={child}
            title={child.title}
            hasModified={child.hasModified}
            iconType="file"
            type={blockTreeTab}
            currentProject={currentProject}
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

const menu = (
  <Menu>
    <Menu.Item
      key="1"
      onClick={e => {
        ipcRenderer.removeAllListeners('chooseItem');
        ipcRenderer.send('choose-directory-dialog', 'showOpenDialog', '选择', [
          'openFile',
        ]);
        ipcRenderer.on('chooseItem', (e, filePath) => {
          getChooseFilePath(filePath, 'processModule');
        });
      }}
    >
      导入流程块
    </Menu.Item>
  </Menu>
);

export default ({ type, setShowLoadingLayer, createItem }) => {
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
  const blockTreeTab = useSelector(state => state.blockcode.blockTreeTab);
  const currentProject = useSelector(state => state.grapheditor.currentProject);

  const persistentStorage = usePersistentStorage();
  const persistentModuleStorage = usePersistentModuleStorage();

  // 右键菜单位置设定
  const [position, setPosition] = useState({});
  const onDragEnter = info => {
    // console.log(info);
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
      traverseTree(data, treeitem => {
        if (treeitem.key === dropKey) {
          // Find dragObject
          let dragObj;

          // info.dropToGap = false 为放到元素头上
          if (!info.dropToGap) {
            console.log('放到元素上');
            // Drop on the content
            loop(data, dropKey, item => {
              if (item.type === 'dir') {
                loop(data, dragKey, (item, index, arr) => {
                  arr.splice(index, 1);
                  dragObj = item;
                });
                item.children = item.children || [];
                // where to insert 示例添加到尾部，可以是随意位置
                item.children.push(dragObj);
              } else {
                // arr.push(dragObj);
                message.error('流程块不能放在流程块上');
              }
            });
          } else {
            console.log('else');
            let ar;
            let i;
            loop(data, dragKey, (item, index, arr) => {
              arr.splice(index, 1);
              dragObj = item;
            });
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
        if (item.key === dropKey) {
          // Find dragObject
          let dragObj;

          if (!info.dropToGap) {
            // Drop on the content
            if (item.type === 'dir') {
              loop(data, dropKey, item => {
                loop(data, dragKey, (item, index, arr) => {
                  arr.splice(index, 1);
                  dragObj = item;
                });
                item.children = item.children || [];
                // where to insert 示例添加到尾部，可以是随意位置
                item.children.push(dragObj);
              });
            } else {
              message.error('流程块不能放在流程块上');
            }
          } else {
            let ar;
            let i;
            loop(data, dragKey, (item, index, arr) => {
              arr.splice(index, 1);
              dragObj = item;
            });
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
      persistentModuleStorage();
      // persistentModuleStorage(
      //   data,
      //   currentProject,
      //   currentCheckedModuleTreeNode
      // );
    }
  };

  const handleDelete = (key, persistentStorage) => {
    if (blockTreeTab === 'secondModule') {
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
    } else if (type === 'process') {
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
    if (blockTreeTab === 'secondModule') {
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
    } else if (type === 'process') {
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

  const handleCreate = () => {
    if (createItem) {
      console.log('配置单个新添加的可拖拽');
      const toolCells = document.querySelectorAll('.process-module-drag');
      const elt = toolCells[toolCells.length - 1];
      const cell = new MxCell(
        `<div class='compoent-content'><label class='component-icon'></label><span class='component-name' title='process'>${cell.innerText}</span></div>`,
        new MxGeometry(0, 0, parseInt(186, 10), parseInt(50, 10)),
        'label;whiteSpace=wrap;html=1;;resizable=0;'
      );
      cell.vertex = true;
      createItem(
        [cell],
        186,
        55,
        // cell.geometry.width,
        // cell.geometry.height,
        'Shape Group',
        null,
        elt
      );
    }
  };

  const refreshGraph = key => {
    // resetGraphEditData();
    showTreeData([key]);
    // changeCheckedTreeNode(key);
  };

  useEffect(() => {
    if (type === 'processModule') {
      event.addListener('create_module_drag', handleCreate);
      console.log('监听');
    }

    return () => {
      if (type === 'processModule') {
        console.log('移除监听');
        event.removeListener('create_module_drag', handleCreate);
      }
    };
  }, []);

  useEffect(() => {
    if (createItem && type === 'processModule') {
      console.log('配置左侧可拖拽');
      let cell = null;
      const toolCells = document.querySelectorAll('.process-module-drag');
      for (let i = 0; i < toolCells.length; i += 1) {
        const elt = toolCells[i];
        // const { label, style, width, height } = elt.dataset;
        cell = new MxCell(
          `<div class='compoent-content'><label class='component-icon'></label><span class='component-name' title='process'>${elt.innerText}</span></div>`,
          new MxGeometry(0, 0, parseInt(186, 10), parseInt(50, 10)),
          'label;whiteSpace=wrap;html=1;;resizable=0;'
        );
        cell.vertex = true;

        createItem(
          [cell],
          186,
          55,
          // cell.geometry.width,
          // cell.geometry.height,
          'Shape Group',
          null,
          elt
        );
      }
    }
  }, [type]);

  const showTreeData = selectedKey => {
    const node = findNodeByKey(processTree, selectedKey[0]);
    if (node.data && Object.keys(node.data).length === 0) {
      let data = getProjectTreeData(currentProject, processTree, node);
      const maxLength = 470000;
      const isOverMaxLength = data[maxLength] !== undefined;
      if (isOverMaxLength) setShowLoadingLayer(true);
      setTimeout(() => {
        data = getDecryptOrNormal(data);
        node.getData = true;
        node.data = { ...data };
        changeCheckedTreeNode(selectedKey[0]);
        if (isOverMaxLength) setShowLoadingLayer(false);
      }, 0);
    } else changeCheckedTreeNode(selectedKey[0]);
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
        height: 'calc(100vh - 162px)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      <div className="tree-panel">
        <Tree
          className={
            type === 'secondModule' ? 'atomicCList-tree' : 'draggable-tree'
          }
          // className="draggable-tree"
          expandedKeys={expandedKeys}
          defaultExpandAll
          switcherIcon={type === 'secondModule' ? '' : <Switcher />}
          showIcon={type === 'secondModule' ? false : true}
          draggable={type === 'secondModule' ? false : true}
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
          treeData={
            type === 'process'
              ? transformTreeTitle(
                  processTree,
                  type,
                  currentProject,
                  blockTreeTab,
                  createItem
                )
              : transformTreeTitle(
                  moduleTree,
                  type,
                  currentProject,
                  blockTreeTab,
                  createItem
                )
          }
          selectedKeys={
            type === 'process'
              ? [currentCheckedTreeNode]
              : [currentCheckedModuleTreeNode]
          }
          onSelect={(selectedKey, e) => {
            const node = findNodeByKey(processTree, selectedKey[0]);
            if (node.data === undefined) {
              // 目录
              return;
            }
            if (type === 'process') {
              if (currentCheckedTreeNode === undefined) {
                // 首次打开时currentCheckedTreeNode为undefined
                setSelectedKey(selectedKey[0]);
                showTreeData(selectedKey);
              } else if (selectedKey.length !== 0) {
                // 选择自身以外的其他节点
                const isModified = hasNodeModified(
                  processTree,
                  currentCheckedTreeNode
                );
                // 当前选中节点是否有更改
                if (isModified) {
                  setSelectedKey(selectedKey[0]);
                  setModalVisible(true); // 提示保存
                  // showTreeData(selectedKey);
                } else {
                  setSelectedKey(selectedKey[0]);
                  showTreeData(selectedKey);
                }
              }
            } else if (currentCheckedModuleTreeNode === undefined) {
              setSelectedKey(selectedKey[0]);
              changeCheckedModuleTreeNode(selectedKey[0]);
            } else if (selectedKey.length !== 0) {
              setSelectedKey(selectedKey[0]);
              changeCheckedModuleTreeNode(selectedKey[0]);
            }
          }}
        />
        <ContextMenu
          position={position}
          handleDelete={handleDelete}
          handleRename={handleRename}
        />
        <SaveConfirmModel
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          type="saveOne"
          onCancelOk={() => {
            refreshGraph(selectedKey);
          }}
          onOk={() => {
            refreshGraph(selectedKey);
          }}
        />
      </div>
      {type === 'processModule' && (
        <Dropdown overlay={menu} trigger={['contextMenu']}>
          <div
            className="rightclick-panel"
            style={{
              height: '100%',
            }}
          />
        </Dropdown>
      )}
    </div>
  );
};
