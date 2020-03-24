import React, {
  Fragment,
  memo,
  useRef,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Icon } from 'antd';
import cloneDeep from 'lodash/cloneDeep';
import uniqueId from 'lodash/uniqueId';
import { useInjectContext } from 'react-hook-easier/lib/useInjectContext';

import {
  useDropTarget,
  useHasLookTarget,
  useDeleteNodeById,
  useUpdateXpath,
  useVisibleDynamicUpdate,
  useWatchCmdDesc,
} from '../../useHooks';

import { BasicStatementTag } from '../../statementTags';
import Interactive from './components/Interactive';
import ItemTypes from '../../statementTypes';

const { ipcRenderer } = require('electron');

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

const BasicStatement = useInjectContext(props => {
  const {
    id,
    card,
    text,
    index,
    visibleTemplate,
    moveCard,
    addCard,
    isTail,
    readOnly,
    isDraggingNode,
    useToggleOpacity,
    useSetClassName,
    useDragSource,
    setIsDraggingNode,
    PLACEHOLDER_STATEMENT,
  } = props;

  const hasLookTarget = useHasLookTarget(card);

  const cmdDesc = useWatchCmdDesc(card);

  const [
    canDrag,
    templateVisible,
    changeToEditableTemplate,
    save,
  ] = useVisibleDynamicUpdate(id, visibleTemplate, readOnly);

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
    canDrag,
  });

  const deleteNodeById = useDeleteNodeById(id);

  const updateXpath = useUpdateXpath();

  /** 保存xpath截图 */
  const [xpathImage, setXpathImage] = useState(card.xpathImage);

  drag(drop(ref));

  // 人机交互能力逻辑
  const [visible, setVisible] = useState(false);

  const [interactiveCard, setInteractiveCard] = useState({});

  const generateEditOperation = card => {
    switch (card.cmdName) {
      case '人机交互':
        return (
          <div
            className="cmd-operation"
            onClick={() => {
              console.log(card);
              !card.layout && (card.layout = {});
              setVisible(true);
              setInteractiveCard(card);
            }}
          >
            交互设计
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={readOnly ? null : ref}
      style={{
        ...style,
        opacity: opacity,
      }}
      className={className}
    >
      <div
        className={isTail ? 'card-content card-content__tail' : 'card-content'}
        data-id={isTail ? '' : id}
      >
        {isTail ? (
          <div>{text}</div>
        ) : (
          <div className="card-content-description">
            <Icon type="home" className="card-content-icon" />
            {text}
            {cmdDesc && (
              <span style={{ color: '#b1aeb2', marginLeft: 8 }}>
                ({cmdDesc || ''})
              </span>
            )}

            <br />
            <div
              className="card-content-visible"
              key={uniqueId('visible_')}
              onClick={e => {
                if (readOnly) return;
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
            ></div>
          </div>
        )}
        {isTail ? (
          <div></div>
        ) : (
          !readOnly && (
            <React.Fragment>
              <div className="card-content-operation">
                <Icon
                  type="play-circle"
                  onClick={() => {
                    console.log('kkk');
                  }}
                />
                <Icon
                  type="eye"
                  onClick={() => {
                    console.log('kkk2');
                  }}
                />
                <Icon
                  type="delete"
                  onClick={() => {
                    deleteNodeById(id);
                    console.log('删除 -->', id);
                  }}
                />
              </div>
              {generateEditOperation(card)}
              <div
                className="card-content-searchtarget"
                style={{
                  display: hasLookTarget ? '' : 'none',
                }}
                onClick={() => {
                  ipcRenderer.send('min');
                  ipcRenderer.send('start_server', id);

                  ipcRenderer.on(
                    'updateXpath',
                    (e, { xpath, imageData, targetId }) => {
                      console.log(xpath, imageData, targetId);
                      if (xpath === undefined) return;
                      // 接收到xpath并作出更新
                      if (targetId !== id) return;
                      card.xpathImage = imageData;
                      setXpathImage(imageData);
                      updateXpath(id, xpath);
                    }
                  );
                }}
              >
                {xpathImage === undefined ? (
                  <Fragment>
                    <Icon
                      type="home"
                      className="card-content-searchtarget-anchor"
                    />
                    查找目标
                  </Fragment>
                ) : (
                  <img
                    src={xpathImage}
                    alt="xpath"
                    style={{ width: 48, height: 32 }}
                  />
                )}
              </div>
            </React.Fragment>
          )
        )}
      </div>
      <div
        className={isTail ? 'card-mask card-mask__tail' : 'card-mask'}
        data-id={isTail ? '' : id}
        ref={dragImage}
      ></div>
      <Interactive
        interactiveCard={interactiveCard}
        visible={visible}
        setVisible={setVisible}
      />
    </div>
  );
});
export default BasicStatement;
