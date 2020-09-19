import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Icon } from 'antd';
import uniqueId from 'lodash/uniqueId';
import cloneDeep from 'lodash/cloneDeep';
import { useSelector } from 'react-redux';
import { useInjectContext } from 'react-hook-easier/lib/useInjectContext';
import useForceUpdate from 'react-hook-easier/lib/useForceUpdate';
import {
  useDropTarget,
  useDeleteNodeById,
  useTransformToPython,
  useVisibleDynamicUpdate,
  useChangeCheckedBlockColor,
} from '../../useHooks';
import { propagateIgnoreChange } from '../../DragContainer/utils';

import ItemTypes from '../../constants/statementTypes';

import './index.scss';

// liuqi
import event from '../../../eventCenter';
import { DEBUG_ONE_STEP } from '../../../../constants/actions/debugInfos';

const style = {
  borderTop: '4px solid transparent',
  borderBottom: '4px solid transparent',
  backgroundColor: 'white',
  backgroundClip: 'padding-box',
  // cursor: 'move',
  position: 'relative',
  marginRight: '8px',
};

const LoopStatement = useInjectContext(props => {
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

  const cards = useSelector(state => state.blockcode.cards);

  const [isFold, setFold] = useState(false);

  const handleEmitCodeTransform = useTransformToPython();

  const [
    backgroundColor,
    border,
    headBackground,
    noneBackground,
    isIgnore,
    setIsIgnore,
    isBreak,
    setIsBreak,
  ] = useChangeCheckedBlockColor(id, card);

  const [
    canDrag,
    templateVisible,
    changeToEditableTemplate,
    save,
  ] = useVisibleDynamicUpdate(id, card.visibleTemplate);

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

  /**
   * 组件整体折叠逻辑
   */
  const handleStatementFlod = () => {
    const loopstatement = document.querySelector(`.loopstatement-fold-${id}`);
    const originalHeight = loopstatement.style.height;
    const overflow = loopstatement.style.overflow;
    const paddingTop = loopstatement.style.paddingTop;
    const paddingBottom = loopstatement.style.paddingBottom;
    loopstatement.style.height = originalHeight ? '' : '0px';
    loopstatement.style.overflow = overflow === 'hidden' ? 'inherit' : 'hidden';
    loopstatement.style.paddingTop = paddingTop ? '' : '10px';
    loopstatement.style.paddingBottom = paddingBottom ? '' : '10px';
    setFold(originalHeight ? false : true);
  };

  const [drag, dragImage] = useDragSource({
    props,
    setIsDraggingNode,
    isFold,
    canDrag,
    handleLoopStatementFlod: handleStatementFlod,
  });

  const deleteNodeById = useDeleteNodeById();

  drag(drop(ref));
  return (
    <div
      style={{ ...style, opacity }}
      ref={isFold ? null : dragImage}
      className={`loopstatement ${className}`}
    >
      <div className="loopstatement-drag-mask" />
      {/* <div
        className="loopstatement-fold-anchor"
        ref={ref}
        onClick={handleStatementFlod}
      >
        <Icon type={isFold ? 'down' : 'up'} />
      </div> */}
      <div
        className="loopstatement-header"
        ref={readOnly ? null : ref}
        style={{
          backgroundColor: isIgnore ? '#9c9494' : headBackground,
          color: headBackground === '#32A67F' ? 'white' : 'black',
        }}
      >
        <div
          className="loopstatement-header-title"
          data-id={id}
          ref={isFold ? dragImage : null}
        >
          <span
            data-id={id}
            key={uniqueId('visible_')}
            onClick={e => {
              const anchor = e.target.dataset.anchor;
              changeToEditableTemplate(anchor);
              // 触发变量的修改
            }}
            onDragStart={e => {
              e.preventDefault();
            }}
            onBlur={save}
            onKeyDown={e => {
              if (e.keyCode === 13) {
                save(e);
              }
            }}
            dangerouslySetInnerHTML={{ __html: templateVisible }}
          />
        </div>
        <div className="loopstatement-header-operation">
          {!readOnly && (
            <>
              <Icon
                type="play-circle"
                onClick={() => {
                  event.emit(DEBUG_ONE_STEP, {
                    isIgnore: card.ignore,
                    cards,
                    id,
                  });
                }}
              />
              <Icon
                type={isIgnore ? 'eye-invisible' : 'eye'}
                onClick={() => {
                  card.ignore = !card.ignore;
                  // propagateIgnoreChange

                  propagateIgnoreChange(card.children, card.ignore);
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

              <Icon
                onClick={handleStatementFlod}
                type={isFold ? 'down' : 'up'}
              />
            </>
          )}
        </div>
      </div>
      <div
        className={`loopstatement-content loopstatement-fold-${id}`}
        style={{
          backgroundColor,
          paddingTop: '10px',
          paddingBottom: '10px',
        }}
      >
        {card.children.map((subChildren, i) => renderStatement(subChildren, i))}
        {!readOnly &&
          renderTailStatement({
            id: `${id}-tail`,
            // text: '双击命令行或者拖拽命令行到此处可以添加命令，delete删除命令',
            text: '拖拽命令行到此处可以添加命令',
            index: PLACEHOLDER_STATEMENT,
            moveCard,
            addCard,
            isDraggingNode,
            setIsDraggingNode,
          })}
      </div>
    </div>
  );
});

export default LoopStatement;
