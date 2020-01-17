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

const LoopStatement = useInjectContext(props => {
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

  drag(drop(ref));

  return (
    <div
      style={{ ...style, opacity }}
      className="loopstatement"
      ref={dragImage}
      className={className}
    >
      <div className="loopstatement-header" ref={ref} data-id={id}>
        循环当 真 时
      </div>
      <div className="loopstatement-content">
        {card.children.map((subChildren, i) => renderStatement(subChildren, i))}
        {renderTailStatement({
          id: `${id}-tail`,
          text: '在此插入循环语句',
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
