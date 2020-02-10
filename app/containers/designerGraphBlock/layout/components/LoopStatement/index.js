import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Icon } from 'antd';
import cloneDeep from 'lodash/cloneDeep';
import { useInjectContext } from 'react-hook-easier/lib/useInjectContext';
import useForceUpdate from 'react-hook-easier/lib/useForceUpdate';
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
  // paddingLeft: '28px',
  // overflow: 'hidden',
  marginRight: '8px',
  //minHeight: '104px',
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

  const [isFold, setFold] = useState(false);

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
    loopstatement.style.height = originalHeight ? '' : '0px';
    setFold(originalHeight ? false : true);
  };

  const [drag, dragImage] = useDragSource({
    props,
    setIsDraggingNode,
    isFold,
    handleLoopStatementFlod: handleStatementFlod,
  });

  drag(drop(ref));

  return (
    <div
      style={{ ...style, opacity }}
      ref={isFold ? null : dragImage}
      className={`loopstatement ${className}`}
    >
      <div className="loopstatement-drag-mask"></div>
      <div
        className="loopstatement-fold-anchor"
        ref={ref}
        onClick={handleStatementFlod}
      >
        <Icon type={isFold ? 'up' : 'down'} />
      </div>
      <div className="loopstatement-header" ref={ref} data-id={id}>
        <div
          className="loopstatement-header-title"
          ref={isFold ? dragImage : null}
        >
          当循环为真时
        </div>
      </div>
      <div className={`loopstatement-content loopstatement-fold-${id}`}>
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
