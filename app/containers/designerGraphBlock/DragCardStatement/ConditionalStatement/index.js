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

// liuqi
import event from '../../../eventCenter';
import { DEBUG_ONE_STEP } from '../../../../constants/actions/debugInfos';

const style = {
  borderTop: '4px solid transparent',
  borderBottom: '4px solid transparent',
  backgroundColor: 'white',
  backgroundClip: 'padding-box',
  cursor: 'move',
  position: 'relative',
  marginRight: '8px',
};

const ConditionalStatement = useInjectContext(props => {
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

  const [
    canDrag,
    templateVisible,
    changeToEditableTemplate,
    save,
  ] = useVisibleDynamicUpdate(id, card.visibleTemplate);

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
    canDrag,
  });

  const deleteNodeById = useDeleteNodeById();

  drop(drag(ref));

  return (
    <div
      className="IFItem"
      style={{ ...style, opacity }}
      ref={isFold ? null : dragImage}
      className={className}
    >
      <div
        className="IFItem-header"
        ref={readOnly ? null : ref}
        style={{
          background: isIgnore ? '#9c9494' : 'rgba(50, 166, 127, 1)',
        }}
      >
        <div
          className="IFItem-header-title"
          data-id={id}
          ref={isFold ? dragImage : null}
        >
          <span
            key={uniqueId('visible_')}
            data-id={id}
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
        <div className="IFItem-header-operation">
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

                  propagateIgnoreChange(card.ifChildren, card.ignore);
                  propagateIgnoreChange(card.elseChildren, card.ignore);
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
            type={isFold ? 'down' : 'up'}
            onClick={() => {
              handleStatementFlod();
            }}
          />
        </div>
      </div>
      <div
        className={`IFItem-content ifstatement-fold-${id}`}
        style={{
          backgroundColor,
        }}
      >
        <div className="IFItem-if">
          {card.ifChildren.map((subChildren, i) => {
            return renderStatement(subChildren, i);
          })}
          {!readOnly &&
            renderTailStatement({
              id: `${id}-ifChildren-tail`,
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
        <div className="IFItem-else">
          <div
            className="IFItem-header IFItem-header__else"
            style={{
              backgroundColor: isIgnore ? '#9c9494' : 'rgba(184, 230, 214, 1)',
            }}
          >
            否则
          </div>
          <div style={{ paddingLeft: 24 }}>
            {card.elseChildren.map((subChildren, i) =>
              renderStatement(subChildren, i)
            )}
            {!readOnly &&
              renderTailStatement({
                id: `${id}-elseChildren-tail`,
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

export default ConditionalStatement;
