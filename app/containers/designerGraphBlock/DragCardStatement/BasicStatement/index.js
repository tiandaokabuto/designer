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
import { Icon, message } from 'antd';
import cloneDeep from 'lodash/cloneDeep';
import uniqueId from 'lodash/uniqueId';
import { useInjectContext } from 'react-hook-easier/lib/useInjectContext';

import PATH_CONFIG from '@/constants/localFilePath.js';
import { CHANGE_CHECKEDID } from '../../../../constants/actions/codeblock';
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

  // 打断点
  useChangeBreakPoint,
} from '../../useHooks';

import { BasicStatementTag } from '../../constants/statementTags';
import Interactive from './components/Interactive';
import CodeBlock from './components/CodeBlock';
import MaskLayer from './components/MaskLayer';
import ItemTypes from '../../constants/statementTypes';

import './index.scss';

import { measureMemory } from 'vm';

// liuqi
import event from '../../../eventCenter';
import { DEBUG_ONE_STEP } from '../../../../constants/actions/debugInfos';

const { ipcRenderer, remote } = require('electron');

const style = {
  borderTop: '4px solid transparent',
  borderBottom: '4px solid transparent',
  // backgroundColor: 'white',
  backgroundClip: 'padding-box',
  cursor: 'move',
  position: 'relative',
  marginRight: '8px',
  // marginLeft: '32px',
};

const process = require('process');

const { exec } = require('child_process');

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
    setInteractiveCard,
    setVisible,
    //断点
    breakPoint,
  } = props;

  const dispatch = useDispatch();

  // 当前卡片信息
  const cards = useSelector(state => state.blockcode.cards);

  const hasLookTarget = useHasLookTarget(card);

  const cmdDesc = useWatchCmdDesc(card);

  const [handleClick, borderColor] = useChangeCompatable(card, isTail);

  const [
    canDrag,
    templateVisible,
    changeToEditableTemplate,
    save,
  ] = useVisibleDynamicUpdate(id, visibleTemplate, readOnly);

  const [
    backgroundColor,
    border,
    ifBackground,
    elseBackground,
    isIgnore,
    setIsIgnore,
    isBreakPoint,
    setIsBreakPoint,
  ] = useChangeCheckedBlockColor(id, card, 'basic');

  // 打调试断点
  // const [isBreakPoint, setIsBreakPoint] = useChangeBreakPoint(id, card);

  const handleEmitCodeTransform = useTransformToPython();

  const [className, setClassName, resetClassName] = useSetClassName();

  const anotherRef = useRef(null);

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

  /** 保存截图 */
  const [targetImage, setTargetImage] = useState(
    card.xpathImage || card.targetImage
  );

  drag(drop(ref));

  // 代码块编写逻辑
  const [codeVisible, setCodeVisible] = useState(false);
  // 展示图片遮罩层
  const [showImgContain, setShowImgContain] = useState(false);

  const generateEditOperation = card => {
    switch (card.cmdName) {
      case '人机交互':
        if (!card.PVCVersion) {
          if (card.layout) {
            const dataArr = [];
            const layoutArr = [];
            if (card.layout.dataMap) {
              Object.keys(card.layout.dataMap).forEach(item => {
                if (card.layout.dataMap[item]) {
                  // card.layout.dataMap[item].id = item;

                  dataArr.push({
                    id: item,
                    type: card.layout.dataMap[item].type,
                    attribute: card.layout.dataMap[item],
                  });
                  layoutArr.push([
                    {
                      id: item,
                      width: '100%',
                    },
                  ]);
                }
              });
              card.properties.required[1].value = JSON.stringify(dataArr);
              card.layout['device-pc-small'] = {};
              card.layout['device-pc-small'].grid = layoutArr;
            }
          }
          card.PVCVersion = 'new';
        }
        return (
          <div
            className="cmd-operation"
            onClick={() => {
              !card.layout &&
                (card.layout = {
                  'device-pc-small': {
                    grid: [],
                  },
                });
              setInteractiveCard(card);
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

  const handleEnlageImg = e => {
    setShowImgContain(true);
    e.stopPropagation();
  };

  const handleClickSearchTarget = () => {
    dispatch({
      type: CHANGE_CHECKEDID,
      payload: id,
    });
    ipcRenderer.send('min');

    const xpathCmdNameArrForWindows = [
      '鼠标-点击目标',
      '鼠标-移动',
      '键盘-目标中按键',
      '键盘-目标中输入文本',
      '截取Windows控件图片',
      '判断元素是否存在',
      '上传文件',
    ];
    const xpathCmdNameForBrowser = '点击元素';
    const mouseCmdName = '鼠标-获取光标位置';
    const windowsCmdNameArr = ['设置窗口状态', '关闭软件窗口'];
    const clickImage = ['点击图片', '判断截屏区域是否存在'];

    if (xpathCmdNameArrForWindows.includes(card.cmdName)) {
      ipcRenderer.send('start_server', id);
      try {
        const worker = exec(PATH_CONFIG('windowHook'));
      } catch (e) {
        console.log(e);
      }
    } else if (mouseCmdName === card.cmdName) {
      ipcRenderer.send('start_server', id);
      try {
        const mouseWorker = exec(`${PATH_CONFIG('WinRun')}`);
      } catch (err) {
        console.log(err);
      }
    } else if (windowsCmdNameArr.includes(card.cmdName)) {
      ipcRenderer.send('start_server', id);
      try {
        const windowsWorker = exec(`${PATH_CONFIG('EnumWinHandle')}`);
      } catch (e) {
        console.log(e);
      }
    } else if (xpathCmdNameForBrowser === card.cmdName) {
      ipcRenderer.send('start_server', id);
      ipcRenderer.send('start_browser_server', id);
      try {
        const browserXpathWorker = exec(`${PATH_CONFIG('getBrowserXpath')}`);
      } catch (e) {
        console.log(e);
      }
    } else if (clickImage.includes(card.cmdName)) {
      ipcRenderer.send('start_server', id);
      try {
        const clickImageWorker = exec(`${PATH_CONFIG('CaptureAreaScreen')}`);
      } catch (e) {
        console.log(e);
      }
    } else if (card.pkg === 'Browser') {
      ipcRenderer.send('start_browser_server', id);
    }

    const handleUpdateXpath = (
      e,
      { targetId, imageData, xpath: xpathBuffer, type }
    ) => {
      let xpath = '';
      if (type === 'win' || type === 'ie') {
        xpath = xpathBuffer;
      } else {
        xpath = JSON.parse(xpathBuffer);
      }
      // const xpath =
      //   type !== 'win' && xpathBuffer ? JSON.parse(xpathBuffer) : xpathBuffer;
      if (xpath === undefined) return;
      // 接收到xpath并作出更新
      if (targetId !== id) return;
      card.xpathImage = imageData;
      card.hasModified = true;
      setTargetImage(imageData);
      updateXpath(id, xpath, type);
      handleEmitCodeTransform(cards);
      remote.getGlobal('sharedObject').xpathStatus = true;
    };

    // 浏览器xpath
    ipcRenderer.removeAllListeners('updateXpath');
    // window自动化xpath
    ipcRenderer.removeAllListeners('updateWinXpath');
    ipcRenderer.removeAllListeners('updateMousePosition');
    ipcRenderer.removeAllListeners('getWindowArray');
    ipcRenderer.removeAllListeners('updateClickImage');

    // 浏览器xpath
    ipcRenderer.on('updateXpath', handleUpdateXpath);
    // window自动化xpath
    ipcRenderer.on('updateWinXpath', handleUpdateXpath);
    ipcRenderer.on(
      'updateMousePosition',
      (e, { x, y, imageData, targetId }) => {
        if (x === undefined || y === undefined) return;
        const position = `[${x}, ${y}]`;
        if (targetId !== id) return;
        card.properties.required[1].value = position;
        card.properties.required[1].updateId = true;
        if (imageData) {
          card.targetImage = imageData;
          setTargetImage(imageData);
        }
        card.hasModified = true;
        handleEmitCodeTransform(cards);
      }
    );
    ipcRenderer.on('getWindowArray', (e, obj) => {
      if (obj.targetId !== id) return;
      card.properties.required[1].valueMapping = obj.resultArr;
      card.properties.required[1].updateId = true;
      card.hasModified = true;
      handleEmitCodeTransform(cards);
    });
    ipcRenderer.on('updateClickImage', (e, { imageData, targetId }) => {
      if (targetId !== id) return;
      console.log(card.properties.required);
      const requiredImageData = card.properties.required.find(
        item => item.cnName === '图片Base64' || item.cnName === '目标元素'
      );
      requiredImageData.updateId = true;
      if (imageData) {
        requiredImageData.value = `"${imageData}"`;
        card.targetImage = imageData;
        setTargetImage(imageData);
      }
      card.hasModified = true;
      handleEmitCodeTransform(cards);
    });
  };

  const searchTargetDesc = card => {
    if (card.main === 'mousePosition') {
      return '定位坐标';
    } else if (['changeWinStatus', 'closeWin'].includes(card.main)) {
      return '获取窗口';
    } else {
      return '查找目标';
    }
  };

  // const graphDataMap = useSelector(state => state.grapheditor.graphDataMap);
  // const graphDataMapRef = useRef({});
  // graphDataMapRef.current = graphDataMap;
  const checkedGraphBlockId = useSelector(
    state => state.grapheditor.checkedGraphBlockId
  );
  const checkedGraphBlockIdRef = useRef({});
  checkedGraphBlockIdRef.current = checkedGraphBlockId;

  // console.log(`!`, card, card.breakPoint);

  // useEffect(() => {
  //   if (ref.current) {
  //     const cardInfo = ref.current.getBoundingClientRect();
  //     console.log(cardInfo);
  //     const left = localStorage.getItem('secondLeft');
  //     if (localStorage.getItem('secondLeftHide') === 'true') {
  //       console.log('左侧0px');
  //     } else {
  //       console.log('左侧宽度');
  //     }
  //   }
  // }, [ref.current]);

  const getDebugLeft = () => {
    // console.log(anotherRef.current);
    if (anotherRef.current) {
      const cardInfo = anotherRef.current.getBoundingClientRect();
      // console.log(cardInfo);
      const left = localStorage.getItem('secondLeft');
      if (localStorage.getItem('secondLeftHide') !== 'true') {
        return cardInfo.x - parseInt(left) - 15;
      } else {
        return cardInfo.x - 15;
      }
    } else {
      return 19;
    }
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
        ref={isTail ? null : anotherRef}
        className={isTail ? 'card-content card-content__tail' : 'card-content'}
        data-id={isTail ? '' : id}
        // style={{
        //   borderLeft: isTail
        //     ? ''
        //     : isBreakPoint === true
        //     ? '8px solid orangered'
        //     : '',
        // }}
      >
        {isTail ? (
          <div>{text}</div>
        ) : (
          <Fragment>
            <div className="card-content-description">
              <div
                className="card-content-description-header"
                style={{
                  color: card.cmdName === '注释' ? 'white' : '',
                }}
              >
                <Icon type="home" className="card-content-icon" />
                {text}
                {cmdDesc && (
                  <span
                    style={{
                      color: card.cmdName === '注释' ? 'white' : '#b1aeb2',
                      marginLeft: 8,
                    }}
                  >
                    ({cmdDesc || ''})
                  </span>
                )}

                <br />
              </div>
              <div
                className="card-content-visible"
                key={uniqueId('visible_')}
                onClick={e => {
                  if (readOnly) return;
                  const { anchor } = e.target.dataset;
                  if (anchor) changeToEditableTemplate(anchor);
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
                style={{
                  color: card.cmdName === '注释' ? 'white' : '',
                }}
                dangerouslySetInnerHTML={{ __html: templateVisible }}
              />
            </div>
            {!readOnly ? (
              <Fragment>
                <div className="card-content-operation">
                  {/* <Icon
                    type="bug"
                    onClick={() => {
                      // console.log(card);
                      setIsBreakPoint(id, card);
                      card.breakPoint = !card.breakPoint;
                    }}
                  /> */}
                  {card.cmdName !== '注释' ? (
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
                        theme="filled"
                        onClick={() => {
                          setIsIgnore();
                          card.ignore = !card.ignore;
                          card.hasModified = true;
                          handleEmitCodeTransform(cards);
                        }}
                      />
                    </>
                  ) : null}
                  <Icon
                    type="delete"
                    theme="filled"
                    onClick={() => {
                      deleteNodeById(id);
                    }}
                  />
                </div>
                {generateEditOperation(card)}
                <div
                  className="card-content-searchtarget"
                  style={{
                    display: hasLookTarget ? '' : 'none',
                  }}
                  onClick={handleClickSearchTarget}
                >
                  {targetImage === undefined ? (
                    <Fragment>
                      <Icon
                        type="plus-circle"
                        className="card-content-searchtarget-anchor"
                      />
                      <span>{searchTargetDesc(card)}</span>
                    </Fragment>
                  ) : (
                    <div className="card-content-searchtarget-content">
                      <img
                        src={targetImage}
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
                        <img src={targetImage} alt="xpath" />
                      </MaskLayer>
                    </div>
                  )}
                </div>
                {card.cmdName === '注释' || card.ignore ? null : (
                  <div
                    style={{
                      background: isBreakPoint ? 'red' : 'pink',
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      position: 'absolute',
                      left: -getDebugLeft(),
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      setIsBreakPoint(id, card);
                      card.breakPoint = !card.breakPoint;
                    }}
                  ></div>
                )}
              </Fragment>
            ) : null}
          </Fragment>
        )}
      </div>
      <div
        className={isTail ? 'card-mask card-mask__tail' : 'card-mask'}
        data-id={isTail ? '' : id}
        style={
          card.cmdName === '注释'
            ? {
                background: 'rgb(156, 148, 148)',
                color: 'white',
              }
            : {
                backgroundColor,
                border,
                borderColor,
              }
        }
        ref={dragImage}
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
