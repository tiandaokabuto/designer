import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Input, Icon, Tree, message } from 'antd';
import { useDrag, useDrop } from 'react-dnd';
import { useSelector } from 'react-redux';
import { useInjectContext } from 'react-hook-easier/lib/useInjectContext';
import cloneDeep from 'lodash/cloneDeep';

import DragCard from './components/DragCard';
import ContextMenu from './components/ContextMenu';
import event from '../eventCenter';
import {
  BasicStatementTag,
  LoopStatementTag,
  ConditionalStatementTag,
} from '../statementTags';
import { traverseTree, findNodeByKey } from '../../../common/utils';

import { query } from './PinYin';

const { TreeNode } = Tree;
const { Search } = Input;

const canDisplay = (match, filter) => {
  if (!match) return false;
  const newMatch = match.toLocaleLowerCase();
  const newFilter = filter.toLocaleLowerCase();
  let toMatch = '';
  for (const char of newMatch) {
    toMatch += char;
    const queryList = query(toMatch);
    if (queryList.includes(newFilter)) {
      return true;
    }
  }
  return false;
};

export default useInjectContext(({ updateAutomicList }) => {
  const atomicCList = useSelector(state => state.blockcode.automicList);
  const favoriteList = useMemo(() => {
    const find = atomicCList.find(item => item.key === 'favorite');
    return find ? find.children : [];
  }, [atomicCList]);

  const [expandedKeys, setExpandedKeys] = useState([]);

  const [filter, setFilter] = useState('');

  const [treeData, setTreeData] = useState([]);

  // 右键菜单位置设定
  const [position, setPosition] = useState({});

  const filterTree = (treeData, filter, parent = [], expandedKeysTemp) => {
    if (!filter || !treeData) return treeData || [];
    treeData.forEach((child, index) => {
      if (!child.children) {
        // 原子能力结点
        if (!canDisplay(child.item.text, filter)) {
          // no match
          child.isFilter = true;
        } else {
          // match and add to expandedKeys
          parent.forEach(item => {
            if (!expandedKeysTemp.includes(item)) {
              expandedKeysTemp.push(item);
            }
          });
        }
      } else {
        // 非原子能力结点
        child.children = filterTree(
          child.children,
          filter,
          parent.concat(child.key),
          expandedKeysTemp
        );
      }
    });
    return treeData.filter(child => {
      if (child.children) {
        return child.children.length;
      } else {
        return !child.isFilter;
      }
    });
  };

  const renderTreeNode = (tree, filter) => {
    let treeData = cloneDeep(tree);
    let expandedKeysTemp = [];
    treeData = filterTree(treeData, filter, [], expandedKeysTemp);

    setExpandedKeys(expandedKeysTemp);
    traverseTree(treeData, node => {
      if (node.item) {
        node.title = <DragCard item={node.item} />;
      }
    });
    return treeData;
  };

  const addToLovedList = key => {
    const node = findNodeByKey(atomicCList, key);
    // console.log(node, atomicCList, updateAutomicList);
    if (favoriteList.some(item => item.key === key)) {
      message.info('已经在收藏列表');
      return;
    }
    node.loved = true;
    favoriteList.push(node);
    updateAutomicList([...atomicCList]);
  };

  const removeFromLovedList = key => {
    const node = findNodeByKey(atomicCList, key);
    node.loved = false;
    const index = favoriteList.findIndex(item => item.key === key);
    favoriteList.splice(index, 1);
    updateAutomicList([...atomicCList]);
  };

  useEffect(() => {
    setTreeData(renderTreeNode(atomicCList, filter));
  }, [atomicCList, filter]);

  const [dragCard, setDragCard] = useState([]);

  return (
    <div className="dragger-editor-item">
      <div className="dragger-editor-item-title">
        <div>组件库</div>
        <Icon
          type="redo"
          onClick={() => {
            event.emit('update_list');
          }}
        />
      </div>
      <div className="dragger-editor-item-search">
        <Input
          placeholder="请输入"
          onChange={e => {
            setFilter(e.target.value);
          }}
        />
      </div>
      {/* <Tree
        showLine={true}
        showIcon={true}
        className="dragger-editor-item-tree"
      >
        {renderTreeNodes(atomicCList)}
      </Tree> */}
      <Tree
        className="atomicCList-tree"
        // selectable={false}
        expandedKeys={expandedKeys}
        onExpand={expandedKeys => {
          setExpandedKeys(expandedKeys);
        }}
        onRightClick={({ event, node }) => {
          setPosition({
            left: event.pageX + 40,
            top: event.pageY - 20,
            node: node.props,
          });
        }}
        onSelect={(_, e) => {
          const props = e.node.props;
          if (props.children) {
            setExpandedKeys(keys => {
              if (keys.includes(props.eventKey)) {
                return keys.filter(item => item !== props.eventKey);
              } else {
                return keys.concat(props.eventKey);
              }
            });
          }
        }}
        treeData={treeData}
      ></Tree>
      <ContextMenu
        position={position}
        addToLovedList={addToLovedList}
        removeFromLovedList={removeFromLovedList}
        // handleDelete={handleDelete}
        // handleRename={handleRename}
      />
    </div>
  );
});
