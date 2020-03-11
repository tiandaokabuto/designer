import React, { useState } from 'react';
import { Tree, Modal } from 'antd';
import { useSelector } from 'react-redux';

import {
  changeProcessTree,
  changeCheckedTreeNode,
} from '../../../../reduxActions';
import Switcher from './Switcher';
import ContextMenu from './ContextMenu';
import { deleteNodeByKey, renameNodeByKey } from '../../../../common/utils';

export default () => {
  const [expandedKeys, setExpandedKeys] = useState([]);
  const processTree = useSelector(state => state.grapheditor.processTree);
  const currentCheckedTreeNode = useSelector(
    state => state.grapheditor.currentCheckedTreeNode
  );
  // 右键菜单位置设定
  const [position, setPosition] = useState({});
  const onDragEnter = info => {
    console.log(info);
    // expandedKeys 需要受控时设置
    // this.setState({
    //   expandedKeys: info.expandedKeys,
    // });
  };

  const onDrop = info => {
    const dropKey = info.node.props.eventKey;
    const dragKey = info.dragNode.props.eventKey;
    const dropPos = info.node.props.pos.split('-');
    const dropPosition =
      info.dropPosition - Number(dropPos[dropPos.length - 1]);

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
  };

  const handleDelete = key => {
    Modal.confirm({
      content: '是否删除该流程',
      onOk() {
        deleteNodeByKey(processTree, key);
        changeProcessTree([...processTree]);
      },
    });
  };

  const handleRename = key => {
    renameNodeByKey(processTree, key);
  };
  return (
    <div>
      <Tree
        className="draggable-tree"
        defaultExpandedKeys={expandedKeys}
        defaultExpandAll={true}
        // switcherIcon={<Switcher />}
        draggable
        blockNode
        onRightClick={({ event, node }) => {
          setPosition({
            left: event.pageX + 40,
            top: event.pageY - 20,
            node: node.props,
          });
        }}
        onDragEnter={onDragEnter}
        onDrop={onDrop}
        treeData={processTree}
        selectedKeys={[currentCheckedTreeNode]}
        onSelect={(selectedKey, e) => {
          changeCheckedTreeNode(selectedKey[0]);
        }}
      />
      <ContextMenu
        position={position}
        handleDelete={handleDelete}
        handleRename={handleRename}
      />
    </div>
  );
};
