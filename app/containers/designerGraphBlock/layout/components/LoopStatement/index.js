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
  // cursor: 'move',
  position: 'relative',
  paddingLeft: '28px',
  overflow: 'hidden',
  marginRight: '8px',
  minHeight: '104px',
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
      <div className="loopstatement-drag-mask"></div>
      <div className="loopstatement-drag-anchor" ref={ref}></div>
      <div className="loopstatement-header" data-id={id}>
        <div className="loopstatement-header-title">当条件满足</div>
      </div>
      <div className="loopstatement-content">
        {card.children.map((subChildren, i) => renderStatement(subChildren, i))}
        {renderTailStatement({
          id: `${id}-tail`,
          text: '双击命令行或者拖拽命令行到此处可以添加命令，delete删除命令',
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
