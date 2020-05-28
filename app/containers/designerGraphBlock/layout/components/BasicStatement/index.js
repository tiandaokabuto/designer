import React, {
  Fragment,
  memo,
  useRef,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useSelector, useDispatch } from 'react-redux';
import { Icon } from 'antd';
import cloneDeep from 'lodash/cloneDeep';
import uniqueId from 'lodash/uniqueId';
import { useInjectContext } from 'react-hook-easier/lib/useInjectContext';

import PATH_CONFIG from '@/constants/localFilePath.js';
import { CHANGE_CHECKEDID } from '../../../../../actions/codeblock';
import {
  useDropTarget,
  useHasLookTarget,
  useDeleteNodeById,
  useUpdateXpath,
  useVisibleDynamicUpdate,
  useWatchCmdDesc,
  useTransformToPython,
  useChangeCheckedBlockColor,
  useChangeCompatable,
} from '../../useHooks';
import { isGetMousePosition } from '../../shared/utils';

import { BasicStatementTag } from '../../statementTags';
import Interactive from './components/Interactive';
import CodeBlock from './components/CodeBlock';
import MaskLayer from './components/MaskLayer';
import ItemTypes from '../../statementTypes';

import './index.scss';

const { ipcRenderer } = require('electron');

const style = {
  borderTop: '4px solid transparent',
  borderBottom: '4px solid transparent',
  backgroundColor: 'white',
  backgroundClip: 'padding-box',
  cursor: 'move',
  position: 'relative',
  marginRight: '8px',
};

const process = require('process');

const { exec } = require('child_process');

const BasicStatement = useInjectContext((props) => {
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

  const dispatch = useDispatch();

  const cards = useSelector((state) => state.blockcode.cards);

  const hasLookTarget = useHasLookTarget(card);

  const hasGetMousePosition = isGetMousePosition(card);

  const cmdDesc = useWatchCmdDesc(card);

  const [handleClick, borderColor] = useChangeCompatable(card, isTail);

  const [
    canDrag,
    templateVisible,
    changeToEditableTemplate,
    save,
  ] = useVisibleDynamicUpdate(id, visibleTemplate, readOnly);

  const [backgroundColor, isIgnore, setIsIgnore] = useChangeCheckedBlockColor(
    id,
    card
  );

  const handleEmitCodeTransform = useTransformToPython();

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

  // 代码块编写逻辑
  const [codeVisible, setCodeVisible] = useState(false);
  // 展示图片遮罩层
  const [showImgContain, setShowImgContain] = useState(false);

  const generateEditOperation = (card) => {
    switch (card.cmdName) {
      case '人机交互':
        return (
          <div
            className="cmd-operation"
            onClick={() => {
              !card.layout && (card.layout = {});
              setVisible(true);
            }}
          >
            交互设计
          </div>
        );
      case '自定义代码块':
        return (
          <div
            className="cmd-operation"
            onClick={() => {
              setCodeVisible(true);
            }}
          >
            编写代码
          </div>
        );
      default:
        return null;
    }
  };

  const saveLayoutChange = (layout) => {
    if (!layout) return;
    // console.log(card);
    Object.assign(card.layout, layout);
    console.log(layout);
    console.log(cards);
    // card.properties.required[1].updateId = true;
    handleEmitCodeTransform(cards);
  };

  const handleEnlageImg = (e) => {
    setShowImgContain(true);
    e.stopPropagation();
  };

  return (
    <div
      ref={readOnly ? null : ref}
      style={{
        ...style,
        opacity,
      }}
      className={className}
      onClick={() => handleClick(id)}
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
              onClick={(e) => {
                if (readOnly) return;
                const { anchor } = e.target.dataset;
                if (anchor) changeToEditableTemplate(anchor);
                // 触发变量的修改
              }}
              onDragStart={(e) => {
                e.preventDefault();
              }}
              onBlur={save}
              onKeyDown={(e) => {
                if (e.keyCode === 13) {
                  save(e);
                }
              }}
              dangerouslySetInnerHTML={{ __html: templateVisible }}
            />
          </div>
        )}
        {isTail ? (
          <div />
        ) : (
          !readOnly && (
            <>
              <div className="card-content-operation">
                <Icon
                  type="play-circle"
                  onClick={() => {
                    console.log('kkk');
                  }}
                />
                <Icon
                  type={isIgnore ? 'eye-invisible' : 'eye'}
                  onClick={() => {
                    setIsIgnore();
                    card.ignore = !card.ignore;
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
              </div>
              {generateEditOperation(card)}
              <div
                className="card-content-searchtarget"
                style={{
                  display: hasLookTarget || hasGetMousePosition ? '' : 'none',
                }}
                onClick={() => {
                  dispatch({
                    type: CHANGE_CHECKEDID,
                    payload: id,
                  });
                  ipcRenderer.send('min');
                  ipcRenderer.send('start_server', id);
                  const xpathCmdNameArr = [
                    '鼠标-点击目标',
                    '鼠标-移动',
                    '键盘-目标中按键',
                    '键盘-目标中输入文本',
                    '截取Windows控件图片',
                    '判断元素是否存在',
                    '上传文件',
                  ];
                  const mouseCmdName = '鼠标-获取光标位置';

                  if (xpathCmdNameArr.includes(card.cmdName)) {
                    try {
                      const worker = exec(PATH_CONFIG('windowHook'));
                    } catch (e) {
                      console.log(e);
                    }
                  } else if (mouseCmdName === card.cmdName) {
                    try {
                      const mouseWorker = exec(`${PATH_CONFIG('WinRun')} -p`);
                    } catch (err) {
                      console.log(err);
                    }
                  }
                  ipcRenderer.removeAllListeners('updateXpath');
                  ipcRenderer.removeAllListeners('updateMousePosition');
                  ipcRenderer.on(
                    'updateXpath',
                    (e, { targetId, imageData, xpath: xpathBuffer, type }) => {
                      const xpath =
                        type !== 'win' && xpathBuffer
                          ? JSON.parse(xpathBuffer)
                          : xpathBuffer;
                      if (xpath === undefined) return;
                      // 接收到xpath并作出更新
                      if (targetId !== id) return;
                      card.xpathImage = imageData;
                      card.hasModified = true;
                      setXpathImage(imageData);
                      updateXpath(id, xpath, type);
                      handleEmitCodeTransform(cards);
                    }
                  );
                  ipcRenderer.on(
                    'updateMousePosition',
                    (e, { x, y, targetId }) => {
                      if (x === undefined || y === undefined) return;
                      const position = `[${x}, ${y}]`;
                      if (targetId !== id) return;
                      card.properties.required[1].value = position;
                      card.properties.required[1].updateId = true;
                      card.hasModified = true;
                      handleEmitCodeTransform(cards);
                    }
                  );
                }}
              >
                {xpathImage === undefined || hasGetMousePosition ? (
                  <>
                    <Icon
                      type="home"
                      className="card-content-searchtarget-anchor"
                    />
                    <span>{hasGetMousePosition ? '定位坐标' : '查找目标'}</span>
                  </>
                ) : (
                  <div className="card-content-searchtarget-content">
                    <img
                      src={xpathImage}
                      alt="xpath"
                      className="card-content-searchtarget-img"
                      style={{ maxWidth: 48, maxHeight: 32 }}
                    />
                    <Icon
                      type="fullscreen"
                      className="card-content-searchtarget-fullscreen"
                      onClick={handleEnlageImg}
                    />
                    <MaskLayer
                      isShow={showImgContain}
                      handleCilckFrangment={() => setShowImgContain(false)}
                    >
                      <img src={xpathImage} alt="xpath" />
                    </MaskLayer>
                  </div>
                )}
              </div>
            </>
          )
        )}
      </div>
      <div
        className={isTail ? 'card-mask card-mask__tail' : 'card-mask'}
        data-id={isTail ? '' : id}
        style={{
          backgroundColor,
          borderColor,
        }}
        ref={dragImage}
      />
      <Interactive
        saveLayoutChange={saveLayoutChange}
        interactiveCard={card}
        visible={visible}
        setVisible={setVisible}
      />
      <CodeBlock
        visible={codeVisible}
        setVisible={setCodeVisible}
        interactiveCard={card}
      />
    </div>
  );
});
export default BasicStatement;
