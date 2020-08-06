import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Icon } from 'antd';
import cloneDeep from 'lodash/cloneDeep';
import { useSelector } from 'react-redux';
import uniqueId from 'lodash/uniqueId';
import { useInjectContext } from 'react-hook-easier/lib/useInjectContext';

import {
  useDropTarget,
  useDeleteNodeById,
  useVisibleDynamicUpdate,
  useChangeCheckedBlockColor,
  useTransformToPython,
} from '../../useHooks';
import { propagateIgnoreChange } from '../../DragContainer/utils';

import ItemTypes from '../../constants/statementTypes';

import './index.scss';

const style = {
  borderTop: '4px solid transparent',
  borderBottom: '4px solid transparent',
  backgroundColor: 'white',
  backgroundClip: 'padding-box',
  cursor: 'move',
  position: 'relative',
  marginRight: '8px',
};

const CatchStatement = useInjectContext(props => {
  const {
    id,
    text,
    card,
    index,
    moveCard,
    addCard,
    readOnly,
    isDraggingNode,
    setIsDraggingNode,
    renderStatement,
    renderTailStatement,
    PLACEHOLDER_STATEMENT,
    useToggleOpacity,
    useSetClassName,
    useDragSource,
  } = props;

  const [isFold, setFold] = useState(false);

  const cards = useSelector(state => state.blockcode.cards);

  const [backgroundColor, isIgnore, setIsIgnore] = useChangeCheckedBlockColor(
    id,
    card
  );

  const handleEmitCodeTransform = useTransformToPython();

  //   const [
  //     canDrag,
  //     templateVisible,
  //     changeToEditableTemplate,
  //     save,
  //   ] = useVisibleDynamicUpdate(id, card.visibleTemplate);

  /**
   * 组件整体折叠逻辑
   */
  const handleStatementFlod = () => {
    const ifstatement = document.querySelector(`.ifstatement-fold-${id}`);
    const originalHeight = ifstatement.style.height;
    ifstatement.style.height = originalHeight ? '' : '0px';
    setFold(originalHeight ? false : true);
  };

  const [className, setClassName, resetClassName] = useSetClassName();

  const opacity = useToggleOpacity({
    isDraggingNode,
    id,
    index,
  });

  const [ref, drop] = useDropTarget({
    setClassName,
    resetClassName,
    isDraggingNode,
    id,
    props,
    className,
    moveCard,
    addCard,
    index,
  });

  const [drag, dragImage] = useDragSource({
    props,
    setIsDraggingNode,
    canDrag: true,
  });

  const deleteNodeById = useDeleteNodeById();

  drop(drag(ref));

  return (
    <div
      className="CatchItem"
      style={{ ...style, opacity }}
      ref={isFold ? null : dragImage}
      className={className}
    >
      <div
        className="CatchItem-header"
        ref={readOnly ? null : ref}
        style={{
          background: isIgnore ? '#9c9494' : 'rgba(50, 166, 127, 1)',
        }}
      >
        <div
          className="CatchItem-header-title"
          data-id={id}
          ref={isFold ? dragImage : null}
        >
          <span
            key={uniqueId('visible_')}
            data-id={id}
            // onClick={e => {
            //   const anchor = e.target.dataset.anchor;
            //   changeToEditableTemplate(anchor);
            //   // 触发变量的修改
            // }}
            // onDragStart={e => {
            //   e.preventDefault();
            // }}
            // onBlur={save}
            // onKeyDown={e => {
            //   if (e.keyCode === 13) {
            //     save(e);
            //   }
            // }}
            dangerouslySetInnerHTML={{ __html: card.visibleTemplate }}
          />
        </div>
        <div className="CatchItem-header-operation">
          {!readOnly && (
            <>
              <Icon
                type={isIgnore ? 'eye-invisible' : 'eye'}
                onClick={() => {
                  card.ignore = !card.ignore;
                  // propagateIgnoreChange

                  propagateIgnoreChange(card.tryChildren, card.ignore);
                  propagateIgnoreChange(card.catchChildren, card.ignore);
                  propagateIgnoreChange(card.finallyChildren, card.ignore);
                  setTimeout(() => {
                    setIsIgnore();
                  }, 0);
                  card.hasModified = true;
                  handleEmitCodeTransform(cards);
                }}
              />
              <Icon
                type="delete"
                onClick={() => {
                  deleteNodeById(id);
                }}
              />
            </>
          )}
          <Icon
            type={isFold ? 'up' : 'down'}
            onClick={() => {
              handleStatementFlod();
            }}
          />
        </div>
      </div>
      <div
        className={`CatchItem-content ifstatement-fold-${id}`}
        style={{
          backgroundColor,
        }}
      >
        <div className="CatchItem-try">
          {card.tryChildren.map((subChildren, i) => {
            return renderStatement(subChildren, i);
          })}
          {!readOnly &&
            renderTailStatement({
              id: `${id}-tryChildren-tail`,
              // text:
              //   '双击命令行或者拖拽命令行到此处可以添加命令，delete删除命令',
              text: '拖拽命令行到此处可以添加命令',
              index: PLACEHOLDER_STATEMENT,
              moveCard,
              addCard,
              isDraggingNode,
              setIsDraggingNode,
            })}
        </div>
        <div className="CatchItem-catch">
          <div
            className="CatchItem-header CatchItem-header__else"
            style={{
              backgroundColor: isIgnore ? '#9c9494' : 'rgba(184, 230, 214, 1)',
            }}
          >
            异常处理
          </div>
          <div style={{ paddingLeft: 24 }}>
            {card.catchChildren.map((subChildren, i) =>
              renderStatement(subChildren, i)
            )}
            {!readOnly &&
              renderTailStatement({
                id: `${id}-catchChildren-tail`,
                // text:
                //   '双击命令行或者拖拽命令行到此处可以添加命令，delete删除命令',
                text: '拖拽命令行到此处可以添加命令',
                index: PLACEHOLDER_STATEMENT,
                moveCard,
                addCard,
                isDraggingNode,
                setIsDraggingNode,
              })}
          </div>
        </div>
        <div className="CatchItem-finally">
          <div
            className="CatchItem-header CatchItem-header__else"
            style={{
              backgroundColor: isIgnore ? '#9c9494' : 'rgba(184, 230, 214, 1)',
            }}
          >
            结束
          </div>
          <div style={{ paddingLeft: 24 }}>
            {card.finallyChildren.map((subChildren, i) =>
              renderStatement(subChildren, i)
            )}
            {!readOnly &&
              renderTailStatement({
                id: `${id}-finallyChildren-tail`,
                // text:
                //   '双击命令行或者拖拽命令行到此处可以添加命令，delete删除命令',
                text: '拖拽命令行到此处可以添加命令',
                index: PLACEHOLDER_STATEMENT,
                moveCard,
                addCard,
                isDraggingNode,
                setIsDraggingNode,
              })}
          </div>
        </div>
      </div>
    </div>
  );
});

export default CatchStatement;
