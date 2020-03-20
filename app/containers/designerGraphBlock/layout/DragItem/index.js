import React, { useState, useRef, useEffect } from 'react';
import { Input, Icon, Tree } from 'antd';
import { useDrag, useDrop } from 'react-dnd';
import { useSelector } from 'react-redux';
import cloneDeep from 'lodash/cloneDeep';

import DragCard from './components/DragCard';
// import Tree from './components/CustomeTreeNode';
import event from '../eventCenter';
import {
  BasicStatementTag,
  LoopStatementTag,
  ConditionalStatementTag,
} from '../statementTags';
import { traverseTree } from '../../../common/utils';

const { TreeNode } = Tree;
const { Search } = Input;

const canDisplay = (match, filter) => {
  return match.toLocaleLowerCase().includes(filter.toLocaleLowerCase());
};

export default () => {
  const atomicCList = useSelector(state => state.blockcode.automicList);

  const [expandedKeys, setExpandedKeys] = useState([]);

  const [filter, setFilter] = useState('');

  const [treeData, setTreeData] = useState([]);

  // 渲染树节点
  // const renderTreeNodes = (data, filter) =>
  //   data.map(item => {
  //     if (item.children) {
  //       return (
  //         <TreeNode
  //           title={item.title}
  //           key={item.key}
  //           icon={item.icon}
  //           depth={item.depth}
  //           filter={filter}
  //           dataRef={item}
  //         >
  //           {renderTreeNodes(item.children)}
  //         </TreeNode>
  //       );
  //     }
  //     return <TreeNode key={item.key} filter={filter} {...item} />;
  //   });
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
        <Search
          placeholder="请输入"
          onSearch={value => {
            setFilter(value);
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
        selectable={false}
        expandedKeys={expandedKeys}
        onExpand={expandedKeys => {
          setExpandedKeys(expandedKeys);
        }}
        treeData={treeData}
      ></Tree>
    </div>
  );
};
