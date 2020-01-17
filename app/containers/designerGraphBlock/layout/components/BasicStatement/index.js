import React, { memo, useRef, useState, useCallback, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import cloneDeep from 'lodash/cloneDeep';
import { useInjectContext } from 'react-hook-easier/lib/useInjectContext';
import { useDropTarget } from '../../useHooks';

import { BasicStatementTag } from '../../statementTags';
import ItemTypes from '../../statementTypes';
const style = {
  borderTop: '4px solid transparent',
  borderBottom: '4px solid transparent',
  // padding: '0.5rem 1rem',
  backgroundColor: 'white',
  backgroundClip: 'padding-box',
  cursor: 'move',
  position: 'relative',
};
const BasicStatement = useInjectContext(props => {
  const {
    id,
    text,
    index,
    moveCard,
    addCard,
    isDraggingNode,
    useToggleOpacity,
    useSetClassName,
    useDragSource,
    setIsDraggingNode,
    PLACEHOLDER_STATEMENT,
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
    setIsDraggingNode,
    props,
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      style={{
        ...style,
        opacity: opacity,
      }}
      className={className}
    >
      <div className="card-content" data-id={id}>
        {text}
      </div>
      <div className="card-mask" data-id={id}></div>
    </div>
  );
});
export default BasicStatement;
