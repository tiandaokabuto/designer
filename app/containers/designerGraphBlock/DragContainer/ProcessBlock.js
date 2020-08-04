import React, { useState, useCallback, useEffect, useRef, memo } from 'react';
import { InjectProvider } from 'react-hook-easier/lib/useInjectContext';
import isEqual from 'lodash/isEqual';
import useDebounce from 'react-hook-easier/lib/useDebounce';
import { useSelector, useDispatch } from 'react-redux';
import cloneDeep from 'lodash/cloneDeep';

import BasicStatement from '../DragCardStatement/BasicStatement';
import LoopStatement from '../DragCardStatement/LoopStatement';
import ConditionalStatement from '../DragCardStatement/ConditionalStatement';
import Interactive from '../DragCardStatement/BasicStatement/components/Interactive';
import {
  BasicStatementTag,
  LoopStatementTag,
  ConditionalStatementTag,
} from '../constants/statementTags';
import {
  PLACEHOLDER_STATEMENT,
  PLACEHOLDER_MAINPROCESS,
} from '../constants/statementTypes';
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
} from '../../../utils/designerGraphBlock/utils';
import { changeAIHintList, setNodeIgnore } from './utils';

import {
  useToggleOpacity,
  useSetClassName,
  useDragSource,
  useEventHandler,
  useTransformToPython,
  useListenMouseAndKeyboard,
} from '../useHooks';

const style = {
  // width: 900,
  padding: '16px 8px 16px 16px',
  overflowY: 'auto',
  height: '100%',
};

export default memo(({ readOnly = false }) => {
  // 注册点击事件
  const event = !readOnly
    ? useEventHandler({
        className: 'dragger-editor-container',
      })
    : null;
  useListenMouseAndKeyboard();

  const cards = useSelector(state => state.blockcode.cards);
  const currentPagePosition = useSelector(
    state => state.temporaryvariable.currentPagePosition
  );
  const currentPagePositionRef = useRef(null);
  currentPagePositionRef.current = currentPagePosition;
  const dispatch = useDispatch();

  const [isDraggingNode, setIsDraggingNode] = useState({});
  const [interactiveCard, setInteractiveCard] = useState(undefined);
  // 人机交互能力逻辑
  const [visible, setVisible] = useState(false);

  const changeCardData = useCallback(
    useDebounce(data => {
      if (isEqual(data, cards)) return;
      console.log('阻断通知cards的变化');
      // dispatch({
      //   type: CHANGE_CARDDATA,
      //   payload: [...data],
      // });
    }, 20),
    [dispatch, cards]
  );

  // const [cards, setCards] = useState([]);
  const moveCard = useCallback(
    (dragItem, hoverItem, insertBefore = false) => {
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
          changeCardData(cards);
          // dispatch({
          //   type: CHANGE_CARDDATA,
          //   payload: [...cards],
          // });
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
          changeCardData(cards);
          // dispatch({
          //   type: CHANGE_CARDDATA,
          //   payload: [...cards],
          // });
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
          changeCardData(cards);
          // dispatch({
          //   type: CHANGE_CARDDATA,
          //   payload: [...cards],
          // });
          // setCards([...cards]);
        }
        return;
      }

      // 首先找到各自的id在当前node中的序号
      const deleteNode = dragNodes.find(item => item.id === dragItem.id);

      const deleteIndex = dragNodes.findIndex(item => item.id === dragItem.id);

      let insertIndex = hoverNodes.findIndex(item => item.id === hoverItem.id);

      if (deleteIndex === -1 || insertIndex === -1) {
        return cards;
      }

      // 删除和插入操作 先克隆一个副本
      const cloneCards = cloneDeep(cards);
      dragNodes.splice(deleteIndex, 1);
      insertIndex = hoverNodes.findIndex(item => item.id === hoverItem.id);
      hoverNodes.splice(
        insertBefore ? insertIndex : insertIndex + 1,
        0,
        deleteNode
      );
      changeCardData(cards);
      // dispatch({
      //   type: CHANGE_CARDDATA,
      //   payload: [...cards],
      // });
      // setCards([...cards]);
    },
    [cards]
  );

  const addCard = useCallback(
    (insertIndex, id, card, newId) => {
      const findId = id.replace(/-tail/, '');
      const isTail = isTailStatement(id);

      let currentLevel = undefined;
      if (isConditionalStatementPlaceholder(findId)) {
        // 条件语句
        const layer = extractLayer(findId);
        const bufId = trimId(findId);
        // const parent = findNodeParent(cards, bufId, isTail);
        currentLevel = findIFNodeLevelById(cards, bufId, layer);
        // card.ignore = parent.ignore;
      } else if (isMainProcessPlaceholder(findId)) {
        // 主流程的占位符
        currentLevel = cards;
      } else {
        // 包含循环语句的占位符和普通语句的情况
        currentLevel = findNodeLevelById(cards, findId, isTail);
        // const parent = findNodeParent(cards, findId, isTail);
        // card.ignore = parent.ignore;
      }

      /* eslint-disable */
      const newNode = useNode(card, newId);

      if (!currentLevel) {
        changeCardData(cards);
        // dispatch({
        //   type: CHANGE_CARDDATA,
        //   payload: [...cards], //cloneDeep(cards),
        // });
        return;
      }

      if (insertIndex === PLACEHOLDER_STATEMENT) {
        currentLevel.push(newNode);
      } else {
        currentLevel.splice(insertIndex, 0, newNode);
      }

      setNodeIgnore(cards, newId);

      changeCardData(cards);
      // dispatch({
      //   type: CHANGE_CARDDATA,
      //   payload: [...cards], //cloneDeep(cards),
      // });
      // return cloneDeep(cards);
      //});
    },
    [cards]
  );

  const renderStatement = (card, index) => {
    switch (card.$$typeof) {
      case BasicStatementTag:
        return (
          <BasicStatement
            index={index}
            id={card.id}
            key={card.id}
            text={card.text}
            card={card}
            visible={card.visible || ''}
            visibleTemplate={card.visibleTemplate || ''}
            readOnly={readOnly}
            setInteractiveCard={setInteractiveCard}
            setVisible={setVisible}
          />
        );
      case LoopStatementTag:
        // 循环结构
        return (
          <LoopStatement
            key={card.id}
            id={card.id}
            index={index}
            card={card}
            readOnly={readOnly}
          />
        );
      case ConditionalStatementTag:
        return (
          <ConditionalStatement
            key={card.id}
            id={card.id}
            index={index}
            card={card}
            readOnly={readOnly}
          />
        );
      default:
      // do nothing
    }
  };

  const renderTailStatement = props => {
    return <BasicStatement {...props} card={{ id: props.id }} isTail={true} />;
  };

  const handleEmitCodeTransform = useTransformToPython();

  /**
   * 实时更新python源代码
   */
  useEffect(() => {
    if (currentPagePositionRef.current !== 'editor') {
      handleEmitCodeTransform(cards);
    }

    // 生成智能匹配的变量Map
    changeAIHintList(cards);
    //
  }, [cards]);

  const saveLayoutChange = layout => {
    if (!layout) return;
    // console.log(card);
    Object.assign(interactiveCard.layout, layout);
    // card.properties.required[1].updateId = true;
    handleEmitCodeTransform(cards);
  };

  return (
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
      <div
        style={{ ...style, height: readOnly ? 'calc(100vh - 113px)' : '100%' }}
        className="scroll-body"
      >
        {cards.map((card, i) => renderStatement(card, i))}
        {interactiveCard && (
          <Interactive
            saveLayoutChange={saveLayoutChange}
            interactiveCard={interactiveCard}
            visible={visible}
            setVisible={setVisible}
          />
        )}
        {!readOnly &&
          renderTailStatement({
            id: PLACEHOLDER_MAINPROCESS,
            // text: '双击命令行或者拖拽命令行到此处可以添加命令，delete删除命令',
            text: '拖拽命令行到此处可以添加命令',
            index: PLACEHOLDER_STATEMENT,
            moveCard,
            addCard,
            isDraggingNode,
            setIsDraggingNode,
          })}
      </div>
    </InjectProvider>
  );
});
