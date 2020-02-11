import React, { useState, useCallback, useEffect } from 'react';
import { Tabs } from 'antd';
import uniqueId from 'lodash/uniqueId';
import { InjectProvider } from 'react-hook-easier/lib/useInjectContext';
import useDebounce from 'react-hook-easier/lib/useDebounce';
import { useStore, useSelector, useDispatch } from 'react-redux';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';

import CodeEditing from './CodeEditing';
import OutputPanel from './OutputPanel';

import BasicStatement from '../components/BasicStatement';
import LoopStatement from '../components/LoopStatement';
import ConditionalStatement from '../components/ConditionalStatement';
import {
  BasicStatementTag,
  LoopStatementTag,
  ConditionalStatementTag,
} from '../statementTags';
import {
  PLACEHOLDER_STATEMENT,
  PLACEHOLDER_MAINPROCESS,
  PREFIX_ID,
} from '../statementTypes';
import {
  trimId,
  useNode,
  findNodeLevelById,
  findIFNodeLevelById,
  isChildrenNode,
  extractLayer,
  isTailStatement,
  isMainProcessPlaceholder,
  isConditionalStatementPlaceholder,
} from '../shared/utils';

import {
  useToggleOpacity,
  useSetClassName,
  useDragSource,
  useEventHandler,
} from '../useHooks';
import cloneDeep from 'lodash/cloneDeep';
import update from 'immutability-helper';

import {
  CHANGE_CARDDATA,
  CHANGE_PYTHONCODE,
} from '../../../../actions/codeblock';
import { transformBlockToCode } from '../../RPAcore';
import eventEmit, { PYTHON_DISPLAY } from '../eventCenter';

import './index.scss';

const { TabPane } = Tabs;
const style = {
  //width: 900,
  padding: '16px 8px 16px 16px',
  overflowY: 'auto',
  height: '100%',
};

const MENU_TYPE = 'MULTI';

function handleClick(e, data, target) {
  console.log(data, data.target.getAttribute('data-id'));
}

const DragContainer = () => {
  // 注册点击事件
  const event = useEventHandler({
    className: 'dragger-editor-container',
  });
  const cards = useSelector(state => state.blockcode.cards);
  const dispatch = useDispatch();

  const [isDraggingNode, setIsDraggingNode] = useState({});

  // const [cards, setCards] = useState([]);
  const moveCard = useCallback(
    (dragItem, hoverItem) => {
      if (isChildrenNode(dragItem, hoverItem)) {
        // 处理当拖拽的是父子结点的特殊情况
        return;
      }
      // FIX ME...  稍后会做深克隆的时间旅行操作，暂时先不考虑
      let dragNodes = findNodeLevelById(cards, dragItem && dragItem.id);
      let hoverNodes = findNodeLevelById(cards, hoverItem.id);

      if (!hoverNodes || !dragNodes) {
        // 遗漏了结点是尾部结点的情况
        if (
          hoverItem.id.includes('Children') &&
          dragNodes !== undefined &&
          dragItem !== undefined
          // && !dragItem.children
        ) {
          const prefixId = hoverItem.id.replace(/-tail/, '');
          const layer = /-(.*)/.exec(prefixId)[1];
          const bufId = prefixId.replace(/-.*/, '');

          const currentLevel = findIFNodeLevelById(cards, bufId, layer);

          const deleteNode = dragNodes.find(item => item.id === dragItem.id);
          const deleteIndex = dragNodes.findIndex(
            item => item.id === dragItem.id
          );
          // 删除和插入操作 先克隆一个副本
          const cloneCards = cloneDeep(cards);
          dragNodes.splice(deleteIndex, 1);
          currentLevel.push(deleteNode);
          dispatch({
            type: CHANGE_CARDDATA,
            payload: [...cards],
          });
          // setCards([...cards]);
        } else if (
          hoverItem.id.includes('tail') &&
          dragNodes !== undefined &&
          dragItem !== undefined &&
          !dragItem.children
        ) {
          const bufId = hoverItem.id.replace(/-tail/, '');
          if (isMainProcessPlaceholder(hoverItem.id)) {
            hoverNodes = cards;
          } else {
            hoverNodes = findNodeLevelById(cards, bufId);
          }
          if (hoverNodes === undefined) return;
          if (!isMainProcessPlaceholder(hoverItem.id)) {
            hoverNodes = hoverNodes.find(item => item.id === bufId).children;
          }
          const deleteNode = dragNodes.find(item => item.id === dragItem.id);

          const deleteIndex = dragNodes.findIndex(
            item => item.id === dragItem.id
          );

          // 删除和插入操作 先克隆一个副本
          const cloneCards = cloneDeep(cards);
          dragNodes.splice(deleteIndex, 1);
          hoverNodes.push(deleteNode);
          dispatch({
            type: CHANGE_CARDDATA,
            payload: [...cards],
          });
          // setCards([...cards]);
        } else if (
          hoverItem.id.includes('tail') &&
          dragNodes !== undefined &&
          dragItem !== undefined &&
          dragItem.children &&
          !hoverItem.id.includes(dragItem.id)
        ) {
          // 特殊的情况, 当循环的语句向尾部结点的拖拽的情况
          const bufId = hoverItem.id.replace(/-tail/, '');
          hoverNodes = findNodeLevelById(cards, bufId);
          if (hoverNodes === undefined) return;
          hoverNodes = hoverNodes.find(item => item.id === bufId).children;
          const deleteNode = dragNodes.find(item => item.id === dragItem.id);
          const deleteIndex = dragNodes.findIndex(
            item => item.id === dragItem.id
          );

          // 删除和插入操作 先克隆一个副本
          const cloneCards = cloneDeep(cards);
          dragNodes.splice(deleteIndex, 1);
          hoverNodes.push(deleteNode);
          dispatch({
            type: CHANGE_CARDDATA,
            payload: [...cards],
          });
          // setCards([...cards]);
        }
        return;
      }

      // 首先找到各自的id在当前node中的序号
      const deleteNode = dragNodes.find(item => item.id === dragItem.id);

      const deleteIndex = dragNodes.findIndex(item => item.id === dragItem.id);

      const insertIndex = hoverNodes.findIndex(
        item => item.id === hoverItem.id
      );

      if (deleteIndex === -1 || insertIndex === -1) {
        return cards;
      }

      // 删除和插入操作 先克隆一个副本
      const cloneCards = cloneDeep(cards);
      dragNodes.splice(deleteIndex, 1);
      hoverNodes.splice(insertIndex, 0, deleteNode);
      dispatch({
        type: CHANGE_CARDDATA,
        payload: [...cards],
      });
      // setCards([...cards]);
    },
    [cards]
  );

  const addCard = useCallback(
    (insertIndex, id, card) => {
      // dispatch({
      //   type: 'add-cards',
      // });
      const findId = id.replace(/-tail/, '');
      const isTail = isTailStatement(id);
      //setCards(cards => {
      let currentLevel = undefined;
      if (isConditionalStatementPlaceholder(findId)) {
        // 条件语句
        const layer = extractLayer(findId);
        const bufId = trimId(findId);
        currentLevel = findIFNodeLevelById(cards, bufId, layer);
      } else if (isMainProcessPlaceholder(findId)) {
        // 主流程的占位符
        currentLevel = cards;
      } else {
        // 包含循环语句的占位符和普通语句的情况
        currentLevel = findNodeLevelById(cards, findId, isTail);
      }
      /* eslint-disable */
      const newNode = useNode(card, uniqueId(PREFIX_ID));
      if (!currentLevel) {
        dispatch({
          type: CHANGE_CARDDATA,
          payload: cloneDeep(cards),
        });
        return; //cloneDeep(cards);
      }
      if (insertIndex === PLACEHOLDER_STATEMENT) {
        currentLevel.push(newNode);
      } else {
        currentLevel.splice(insertIndex, 0, newNode);
      }
      dispatch({
        type: CHANGE_CARDDATA,
        payload: cloneDeep(cards),
      });
      // return cloneDeep(cards);
      //});
    },
    [cards]
  );

  const renderStatement = (card, index) => {
    switch (card.$$typeof) {
      case BasicStatementTag:
        return (
          <ContextMenuTrigger id={MENU_TYPE} key={card.id} holdToDisplay={1000}>
            <BasicStatement
              index={index}
              id={card.id}
              text={card.text}
              card={card}
            />
          </ContextMenuTrigger>
        );
      case LoopStatementTag:
        // 循环结构
        return (
          <ContextMenuTrigger id={MENU_TYPE} key={card.id} holdToDisplay={1000}>
            <LoopStatement id={card.id} index={index} card={card} />
          </ContextMenuTrigger>
        );
      case ConditionalStatementTag:
        return (
          <ContextMenuTrigger id={MENU_TYPE} key={card.id} holdToDisplay={1000}>
            <ConditionalStatement
              key={card.id}
              id={card.id}
              index={index}
              card={card}
            />
          </ContextMenuTrigger>
        );
      default:
      // do nothing
    }
  };

  const renderTailStatement = props => {
    return <BasicStatement {...props} card={{ id: props.id }} isTail={true} />;
  };

  const handleEmitCodeTransform = useCallback(
    useDebounce(cards => {
      const result = transformBlockToCode(cards);
      dispatch({
        type: CHANGE_PYTHONCODE,
        payload: result.output,
      });
    }, 800),
    []
  );

  /**
   * 实时更新python源代码
   */
  useEffect(() => {
    handleEmitCodeTransform(cards);
    // writeFile(
    //   __dirname + '/containers/designerGraphBlock/python/test.py',
    //   result.output
    // );
  }, [cards]);

  return (
    <div className="dragger-editor-container">
      <div className="dragger-editor-title">流程块1</div>
      <div className="dragger-editor-container-codeblock">
        <Tabs
          defaultActiveKey="codeblock"
          className="dragger-editor-container-tabs"
        >
          <TabPane tab="可视化" key="codeblock">
            <InjectProvider
              value={{
                renderStatement,
                renderTailStatement,
                addCard,
                moveCard,
                isDraggingNode,
                setIsDraggingNode,
                PLACEHOLDER_STATEMENT,
                useToggleOpacity,
                useSetClassName,
                useDragSource,
              }}
            >
              <div style={style} className="scroll-body">
                {cards.map((card, i) => renderStatement(card, i))}
                {renderTailStatement({
                  id: PLACEHOLDER_MAINPROCESS,
                  text:
                    '双击命令行或者拖拽命令行到此处可以添加命令，delete删除命令',
                  index: PLACEHOLDER_STATEMENT,
                  moveCard,
                  addCard,
                  isDraggingNode,
                  setIsDraggingNode,
                })}
              </div>
            </InjectProvider>
          </TabPane>
          <TabPane tab="源代码" key="codesource">
            <CodeEditing />
          </TabPane>
        </Tabs>
        <OutputPanel />
      </div>

      <ContextMenu id={MENU_TYPE}>
        <MenuItem onClick={handleClick} data={{ action: 'Added' }}>
          Add 1 count
        </MenuItem>
        <MenuItem onClick={handleClick} data={{ action: 'Removed' }}>
          Remove 1 count
        </MenuItem>
      </ContextMenu>
    </div>
  );
};
export default DragContainer;
