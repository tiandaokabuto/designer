import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Icon } from 'antd';
import cloneDeep from 'lodash/cloneDeep';
import { useInjectContext } from 'react-hook-easier/lib/useInjectContext';

import { useDropTarget, useDeleteNodeById } from '../../useHooks';

import ItemTypes from '../../statementTypes';

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

const ConditionalStatement = useInjectContext(props => {
  const {
    id,
    text,
    card,
    index,
    moveCard,
    addCard,
    isDraggingNode,
    setIsDraggingNode,
    renderStatement,
    renderTailStatement,
    PLACEHOLDER_STATEMENT,
    useToggleOpacity,
    useSetClassName,
    useDragSource,
  } = props;

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
  });

  const deleteNodeById = useDeleteNodeById();

  drop(drag(ref));

  return (
    <div
      className="IFItem"
      style={{ ...style, opacity }}
      ref={dragImage}
      className={className}
    >
      <div className="IFItem-header" ref={ref} data-id={id}>
        <div className="IFItem-header-title">当条件满足</div>
        <div className="IFItem-header-operation">
          <Icon
            type="delete"
            onClick={() => {
              deleteNodeById(id);
              console.log('删除 -->', id);
            }}
          />
          <Icon type="down" />
        </div>
      </div>
      <div className="IFItem-content">
        <div className="IFItem-if">
          {card.ifChildren.map((subChildren, i) => {
            return renderStatement(subChildren, i);
          })}
          {renderTailStatement({
            id: `${id}-ifChildren-tail`,
            text: '在此插入if语句',
            index: PLACEHOLDER_STATEMENT,
            moveCard,
            addCard,
            isDraggingNode,
            setIsDraggingNode,
          })}
        </div>
        <div className="IFItem-else">
          <div className="IFItem-header IFItem-header__else">否则</div>
          <div style={{ paddingLeft: 24 }}>
            {card.elseChildren.map((subChildren, i) =>
              renderStatement(subChildren, i)
            )}
            {renderTailStatement({
              id: `${id}-elseChildren-tail`,
              text: '在此插入else语句',
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
