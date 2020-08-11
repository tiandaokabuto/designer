import React, { useState, useRef, useMemo, useEffect, Fragment } from 'react';
import { Input, Icon, Tree, message, Tabs } from 'antd';
import { useDrag, useDrop } from 'react-dnd';
import { useSelector } from 'react-redux';
import { useInjectContext } from 'react-hook-easier/lib/useInjectContext';
import useDebounce from 'react-hook-easier/lib/useDebounce';
import useThrottle from 'react-hook-easier/lib/useThrottle';
import cloneDeep from 'lodash/cloneDeep';

import DragCard from './components/DragCard';
import ContextMenu from './components/ContextMenu';
import ProcessTree from '../../designerGraphEdit/GraphItem/components/ProcessTree';
import event from '@/containers/eventCenter';
import {
  BasicStatementTag,
  LoopStatementTag,
  ConditionalStatementTag,
} from '../constants/statementTags';
import { traverseTree, findNodeByKey } from '_utils/utils';
import { changeBlockTreeTab } from '../../reduxActions';

import { query } from './PinYin';
import { saveAutomicList } from './utils';

import './index.scss';

const { TabPane } = Tabs;
const { TreeNode } = Tree;
const { Search } = Input;
const MAX_RENCENT_DEQUEUE_LENGTH = 10;

let isMouseDown = false;
let startOffset = 0;

/**
 *
 * @param {*} match  待匹配文本
 * @param {*} filter
 */
const canDisplay = (item, filter) => {
  const { text, cmdDesc } = item;
  let newMatchText = '';
  let newMatchCmdDesc = '';
  if (!text && !cmdDesc) return false;
  if (text) newMatchText = text.toLocaleLowerCase();
  if (cmdDesc) newMatchCmdDesc = cmdDesc.toLocaleLowerCase();
  const newFilter = filter.toLocaleLowerCase();
  let toMatch = '';
  if (newMatchText.includes(newFilter) || newMatchCmdDesc.includes(newFilter)) {
    return [newFilter];
  }
  for (const char of newMatchText) {
    toMatch += char;
    const queryList = query(toMatch);

    if (queryList.includes(newFilter)) {
      return queryList;
    }
  }
  toMatch = '';
  for (const char of newMatchCmdDesc) {
    toMatch += char;
    const queryList = query(toMatch);

    if (queryList.includes(newFilter)) {
      return queryList;
    }
  }
  return false;
};

export default useInjectContext(
  ({ updateAutomicList, updateCheckedBlockId }) => {
    const atomicCList = useSelector(state => state.blockcode.automicList);

    const blockTreeTab = useSelector(state => state.blockcode.blockTreeTab);

    const favoriteList = useMemo(() => {
      const find = atomicCList.find(item => item.key === 'favorite');
      return find ? find.children : [];
    }, [atomicCList]);

    const recentList = useMemo(() => {
      const find = atomicCList.find(item => item.key === 'recent');
      return find ? find.children : [];
    }, [atomicCList]);

    const [expandedKeys, setExpandedKeys] = useState([]);

    const [isAllExpand, setIsAllExpand] = useState(false);

    const [filter, setFilter] = useState('');

    const [treeData, setTreeData] = useState([]);

    // 右键菜单位置设定
    const [position, setPosition] = useState({});

    const [dragCard, setDragCard] = useState([]);

    const filterTree = (treeData, filter, parent = [], expandedKeysTemp) => {
      if (!filter || !treeData) return treeData || [];
      treeData.forEach((child, index) => {
        if (!child.children) {
          // 原子能力结点
          let find = false;
          if (child.item) {
            find = canDisplay(child.item, filter);
          }
          if (!find) {
            // no match
            child.isFilter = true;
          } else {
            // match and add to expandedKeys
            child.filterList = find;
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

    const addToRecentList = item => {
      const index = recentList.findIndex(el => el.key === item.key);

      if (index !== -1) {
        const node = recentList.splice(index, 1);
        recentList.unshift(...node);
      } else {
        if (recentList.length >= MAX_RENCENT_DEQUEUE_LENGTH) {
          recentList.pop();
        }
        recentList.unshift(item);
      }
      // Promise.resolve().then(() => {

      // });
      setTimeout(() => {
        updateAutomicList([...atomicCList]);
        saveAutomicList(cloneDeep(atomicCList));
      }, 0);
    };

    const renderTreeNode = (tree, filter) => {
      let treeData = cloneDeep(tree);
      let expandedKeysTemp = [];
      if (filter) {
        const originTreeData = treeData;
        // 搜索只对可用进行搜索
        treeData = filterTree(
          treeData.filter(item => item.title === '可用'),
          filter,
          [],
          expandedKeysTemp
        );
        // 拼接原来的可用和收藏列表
        treeData = originTreeData
          .filter(item => item.title !== '可用')
          .concat(treeData);
        setExpandedKeys(expandedKeys => {
          return Array.from(new Set([...expandedKeys, ...expandedKeysTemp]));
        });
      }
      traverseTree(treeData, node => {
        if (node.item) {
          node.title = (
            <DragCard
              item={node.item}
              node={node}
              filter={filter}
              addToRecentList={addToRecentList}
              updateCheckedBlockId={updateCheckedBlockId}
            />
          );
        }
      });
      return treeData;
    };

    const addToLovedList = key => {
      const node = findNodeByKey(atomicCList, key);
      if (favoriteList.some(item => item.key === key)) {
        message.info('已经在收藏列表');
        return;
      }
      node.loved = true;
      favoriteList.push(node);
      updateAutomicList([...atomicCList]);
      saveAutomicList(cloneDeep(atomicCList));
    };

    const removeFromLovedList = key => {
      const node = findNodeByKey(atomicCList, key);
      node.loved = false;
      const index = favoriteList.findIndex(item => item.key === key);
      favoriteList.splice(index, 1);
      updateAutomicList([...atomicCList]);
      saveAutomicList(cloneDeep(atomicCList));
    };

    useEffect(() => {
      setTreeData(renderTreeNode(atomicCList, filter));
    }, [atomicCList, filter]);

    const getEditorItemWidth = () => {
      const outputDom = document.querySelector('.dragger-editor-item');
      return parseFloat(window.getComputedStyle(outputDom).width);
    };

    const setEditorItemWidth = () => {
      const outputDom = document.querySelector('.dragger-editor-item');
      const width = localStorage.getItem('secondLeft');
      const leftHide = localStorage.getItem('secondLeftHide');
      if (leftHide === 'true') {
        outputDom.style.display = 'none';
        document.querySelector('.container-left').style.display = '';
      }
      outputDom.style.flexBasis = width + 'px';
    };

    useEffect(() => {
      setEditorItemWidth();
      const handleAnchorMouseMove = useThrottle(e => {
        if (isMouseDown) {
          let offset = e.pageX - startOffset; // 偏移量
          // console.log('startOffset - e.pageX = ', offset);
          startOffset = e.pageX;
          // if (e.clientX <= 239) return;
          const outputDom = document.querySelector('.dragger-editor-item');
          const originWidth = getEditorItemWidth();
          const currentWidth = originWidth + offset;
          outputDom.style.flexBasis = currentWidth + 'px';
          localStorage.setItem('secondLeft', currentWidth);
          if (currentWidth < 130) {
            outputDom.style.display = 'none';
            document.querySelector('.container-left').style.display = '';
            localStorage.setItem('secondLeftHide', 'true');
          }
        }
      }, 0);

      const handleMouseUp = () => {
        isMouseDown = false;
      };
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mousemove', handleAnchorMouseMove);
      return () => {
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('mousemove', handleAnchorMouseMove);
      };
    }, []);

    const searchKeyWord = useDebounce(keyword => setFilter(keyword), 300);

    return (
      <div
        className="dragger-editor-item"
        onMouseDown={e => {
          isMouseDown = true;
          startOffset = e.pageX;
        }}
      >
        <div
          onMouseDown={e => {
            e.stopPropagation();
          }}
        >
          <div className="dragger-editor-item-title">
            <div className="dragger-editor-item-title-text">组件库</div>
            <div className="dragger-editor-item-title-icons">
              <Icon
                type={isAllExpand ? 'minus-square' : 'plus-square'}
                style={{ marginRight: '10px' }}
                onClick={() => {
                  const data = [];
                  traverseTree(treeData, item => {
                    if (item.children) {
                      data.push(item.key);
                    }
                  });
                  if (expandedKeys.length !== data.length) {
                    setExpandedKeys(data);
                    setIsAllExpand(true);
                  } else {
                    setExpandedKeys([]);
                    setIsAllExpand(false);
                  }
                }}
              />
              <Icon
                type="redo"
                onClick={() => {
                  event.emit('update_list');
                }}
              />
            </div>
          </div>
          <div
            style={{
              // position: 'fixed',
              bottom: '0',
              // maxWidth: '239px',
            }}
          >
            <Tabs
              defaultActiveKey={blockTreeTab}
              className="dragger-editor-container-tabs"
              tabPosition="bottom"
              onChange={key => {
                changeBlockTreeTab(key);
              }}
            >
              <TabPane tab="组件库" key="atomic">
                <div
                  style={{
                    height: 'calc(100vh - 170px)',
                  }}
                >
                  <div className="dragger-editor-item-search">
                    <Input
                      placeholder="请输入"
                      allowClear
                      onChange={e => searchKeyWord(e.target.value)}
                    />
                  </div>
                  <Tree
                    className="atomicCList-tree"
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
                  />
                  <ContextMenu
                    position={position}
                    addToLovedList={addToLovedList}
                    removeFromLovedList={removeFromLovedList}
                  />
                </div>
              </TabPane>
              <TabPane tab="流程块" key="secondModule">
                <ProcessTree type={'secondModule'}></ProcessTree>
              </TabPane>
            </Tabs>
          </div>
        </div>
      </div>
    );
  }
);