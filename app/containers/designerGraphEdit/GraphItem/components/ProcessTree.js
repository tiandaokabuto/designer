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
  changeExpandedKeys,
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
import './ProcessTree.scss';

const { ipcRenderer } = require('electron');

const { mxCell: MxCell, mxGeometry: MxGeometry } = mxgraph;

const LiuchengSVG = () => (
  <svg
    width="16px"
    height="16px"
    viewBox="0 0 16 16"
    version="1.1"
    fill="currentColor"
  >
    <path d="M6,0 C6.55228475,0 7,0.44771525 7,1 L7,4 C7,4.55228475 6.55228475,5 6,5 L4.039,5 L4.03982301,11.2743363 C4.03982301,12.0540324 4.63471109,12.694785 5.395363,12.7674697 L5.53982301,12.7743363 L9,12.774 L9,12 C9,11.4477153 9.44771525,11 10,11 L15,11 C15.5522847,11 16,11.4477153 16,12 L16,15 C16,15.5522847 15.5522847,16 15,16 L10,16 C9.44771525,16 9,15.5522847 9,15 L9,13.774 L5.53982301,13.7743363 C4.21433961,13.7743363 3.12978434,12.7428003 3.04514069,11.438712 L3.03982301,11.2743363 L3.039,5 L1,5 C0.44771525,5 0,4.55228475 0,4 L0,1 C0,0.44771525 0.44771525,0 1,0 L6,0 Z M15,12 L10,12 L10,15 L15,15 L15,12 Z M15,4 C15.5522847,4 16,4.44771525 16,5 L16,8 C16,8.55228475 15.5522847,9 15,9 L10,9 C9.44771525,9 9,8.55228475 9,8 L9,5 C9,4.44771525 9.44771525,4 10,4 L15,4 Z M15,5 L10,5 L10,8 L15,8 L15,5 Z M6,1 L1,1 L1,4 L6,4 L6,1 Z"></path>
  </svg>
);

const MuluSVG = () => (
  <svg
    width="16px"
    height="16px"
    viewBox="0 0 16 16"
    version="1.1"
    fill="currentColor"
  >
    <path d="M9,0 L9,5 L16,5 L16,16 L0,16 L0,0 L9,0 Z M8,1 L1,1 L1,15 L8,15 L8,1 Z M15,6 L9,6 L9,15 L15,15 L15,6 Z M6,11 L6,12 L3,12 L3,11 L6,11 Z M13,10 L13,11 L11,11 L11,10 L13,10 Z M6,7 L6,8 L3,8 L3,7 L6,7 Z M6,3 L6,4 L3,4 L3,3 L6,3 Z"></path>
  </svg>
);

export const MuluIcon = props => <Icon component={MuluSVG} {...props} />;
export const LiuchengIcon = props => (
  <Icon component={LiuchengSVG} {...props} />
);

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
    // mulu-${node.key.replace('key_', '')}
    <div
      className={`treenode-title mulu-${node.key}`}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      {iconType === 'mulu' ? (
        <MuluIcon
          style={{
            marginRight: 8,
            marginLeft: 12,
            display: 'flex',
            alignItems: 'center',
          }}
        />
      ) : (
        <LiuchengIcon
          style={{
            marginRight: 8,
            marginLeft: 12,
            display: 'flex',
            alignItems: 'center',
          }}
        />
      )}
      {type === 'secondModule' && node.type === 'process' ? (
        <DragCard
          title={title}
          node={node}
          item={node}
          tabType={type}
          currentProject={currentProject}
        />
      ) : (
        // <Tooltip
        //   placement="right"
        //   title={title}
        //   overlayStyle={{ paddingLeft: '68px' }}
        // >
        <div
          className={dragModule ? `process-module-drag` : ``}
          style={{
            display: 'block',
            flexBasis: 150,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={title}
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
              iconType="liucheng"
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
              iconType="liucheng"
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
            iconType="mulu"
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

  const expandedKeysFromRedux = useSelector(
    state => state.grapheditor.expandedKeysFromRedux
  );

  const [createItemTag, setCreateItemTag] = useState(0);

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
    console.log(info);
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

  const handleDelete = (key, persistentStorageStorage) => {
    if (blockTreeTab === 'secondModule') {
      Modal.confirm({
        content: '请确认是否删除?',
        onOk() {
          deleteNodeByKey(type, moduleTree, currentProject, key);
          changeCheckedModuleTreeNode(undefined);
          changeModuleTree([...moduleTree]);
          // resetGraphEditData();
          persistentStorageStorage();
        },
      });
    } else if (type === 'process') {
      Modal.confirm({
        content: '请确认是否删除?',
        onOk() {
          deleteNodeByKey(type, processTree, currentProject, key);
          changeProcessTree([...processTree]);
          resetGraphEditData();
          persistentStorageStorage();
        },
      });
    } else {
      console.log('删除复用');
      Modal.confirm({
        content: '请确认是否删除?',
        onOk() {
          deleteNodeByKey(type, moduleTree, currentProject, key);
          changeCheckedModuleTreeNode(undefined);
          changeModuleTree([...moduleTree]);
          // resetGraphEditData();
          persistentStorageStorage();
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
    setCreateItemTag(count => count + 1);
  };

  const refreshGraph = key => {
    // resetGraphEditData();
    showTreeData([key]);
    // changeCheckedTreeNode(key);
  };

  useEffect(() => {
    event.addListener('create_module_drag', handleCreate);
    console.log('监听');
    return () => {
      console.log('移除监听');
      event.removeListener('create_module_drag', handleCreate);
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
          `<div class='compoent-content' data-type='type-module'><label class='component-icon'></label><span class='component-name' title='process'>${elt.innerText}</span></div>`,
          new MxGeometry(0, 0, parseInt(96, 10), parseInt(48, 10)),
          'label;whiteSpace=wrap;html=1;resizable=0;shadow=1;rounded=1;fillColor=#F2FAF7;strokeColor=#32A67F;gradientColor=none;fontColor=#000000;'
        );
        cell.vertex = true;

        createItem([cell], 96, 48, 'Shape Group', null, elt);
      }
    }
  }, [type, createItemTag]);

  const showTreeData = selectedKey => {
    const node = findNodeByKey(processTree, selectedKey[0]);
    if (node.data && Object.keys(node.data).length === 0) {
      console.log('未加载过的节点');
      let data = getProjectTreeData(currentProject, processTree, node);
      const maxLength = 470000;
      const isOverMaxLength = data[maxLength] !== undefined;
      if (isOverMaxLength) setShowLoadingLayer(true);
      setTimeout(() => {
        data = getDecryptOrNormal(data);
        node.getData = true;
        node.data = { ...data };
        localStorage.setItem('temporaryData', JSON.stringify(data));
        changeCheckedTreeNode(selectedKey[0]);
        if (isOverMaxLength) setShowLoadingLayer(false);
      }, 0);
    } else {
      console.log(node);
      localStorage.setItem('temporaryData', JSON.stringify(node.data));
      changeCheckedTreeNode(selectedKey[0]);
    }
  };

  useEffect(() => {
    changeExpandedKeys([...expandedKeysFromRedux]);
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
    <>
      <div className="tree-panel">
        <Tree
          className={
            type === 'secondModule' ? 'atomicCList-tree' : 'draggable-tree'
          }
          // className="draggable-tree"
          expandedKeys={expandedKeysFromRedux}
          defaultExpandAll
          switcherIcon={
            type === 'secondModule' ? (
              false
            ) : (
              <Switcher expandedKeys={expandedKeysFromRedux} level={1} />
            )
          }
          showIcon={type === 'secondModule' ? false : true}
          draggable={type === 'secondModule' ? false : true}
          blockNode
          onExpand={expandKeys => {
            console.log(expandKeys);
            changeExpandedKeys(expandKeys);
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
    </>
  );
};
