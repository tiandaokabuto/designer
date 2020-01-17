import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import cloneDeep from 'lodash/cloneDeep';
import { useInjectContext } from 'react-hook-easier/lib/useInjectContext';

import { useDropTarget } from '../../useHooks';

import ItemTypes from '../../statementTypes';

import './index.scss';

const style = {
  borderTop: '4px solid transparent',
  borderBottom: '4px solid transparent',
  backgroundColor: 'white',
  backgroundClip: 'padding-box',
  cursor: 'move',
  position: 'relative',
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

  drop(drag(ref));

  return (
    <div
      className="IFItem"
      style={{ ...style, opacity }}
      ref={dragImage}
      className={className}
    >
      <div className="IFItem-header" ref={ref} data-id={id}>
        如果条件成立则
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
          <div className="IFItem-header">否则</div>
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
  );
});

export default ConditionalStatement;
