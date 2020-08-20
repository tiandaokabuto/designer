import './index.scss';
import React, { useState, Fragment, useRef, memo, useEffect } from 'react';
import { Icon, Dropdown, Menu, Tag, message } from 'antd';
import axios from 'axios';
import { useSelector } from 'react-redux';

import NewProject from './NewProject';
import api from '../../../api';
import { getModifiedNodes } from '_utils/utils';
import { changeTreeTab } from '../../reduxActions/index';
import HelpModel from './HelpModel';
import usePersistentStorage from '../DragEditorHeader/useHooks/usePersistentStorage';
import SaveConfirmModel from '../../designerGraphEdit/GraphItem/components/SaveConfirmModel';

//liuqi
import { useTransformProcessToPython } from '../../designerGraphEdit/useHooks';
import event, {
  PYTHOH_DEBUG_SERVER_START,
  PYTHOH_DEBUG_BLOCK_ALL_RUN,
  PYTHOH_DEBUG_BLOCK_ALL_RUN_END,
  PYTHOH_DEBUG_CARDS_ALL_RUN,
  PYTHOH_DEBUG_BLOCK_ALL_RUN_PAUSE,
} from '../../eventCenter';
import {
  runDebugServer,
  runAllStepByStepAuto,
  killTask,
} from '../../../utils/DebugUtils/runDebugServer';
import {
  getTempCenter,
  setPause,
  clearPause,
} from '../../designerGraphEdit/RPAcore';

// *新 DEBUG liuqi
import {
  DEBUG_OPEN_DEBUGSERVER,
  DEBUG_CLOSE_DEBUGSERVER,
  DEBUG_RUN_BLOCK_ALL_RUN,
} from '../../../constants/actions/debugInfos';
import { changeDebugInfos } from '../../reduxActions';

const { ipcRenderer, remote } = require('electron');

const generateMenu = arr => {
  return (
    <Menu>
      {arr.map((subMenu, index) => {
        return (
          <Menu.Item key={index}>
            <a onClick={subMenu.onClick || (() => {})}>{subMenu.title}</a>
          </Menu.Item>
        );
      })}
    </Menu>
  );
};

/**
 * 处理窗口的缩小、全屏、关闭操作
 * @param {*} op
 */
const handleWindowOperation = op => {
  ipcRenderer.send(op);
};

export default memo(({ history, tag }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [visible, setVisible] = useState(undefined);
  const [helpModelVisible, setHelpModelVisible] = useState(false);
  const [saveEvent, setSaveEvent] = useState('');
  const globalUserName = remote.getGlobal('sharedObject').userName;

  const resetVisible = () => {
    setVisible(undefined);
  };
  const processTree = useSelector(state => state.grapheditor.processTree);
  const persistentStorage = usePersistentStorage();
  const modifiedNodesArr = useRef([]);
  // const [modifiedNodesArr, setModifiedNodesArr] = useState([]);

  const jumpToProject = () => {
    const historyState = history.location.state;
    const projectName =
      historyState && historyState.projectName ? historyState.projectName : '';
    history.push({
      pathname: '/',
      state: {
        jump: true,
        projectName,
      },
    });
  };

  const TOOLS_DESCRIPTION = [
    {
      title: '项目',
      onClick: () => {
        modifiedNodesArr.current = getModifiedNodes(processTree);
        if (modifiedNodesArr.current.length !== 0) {
          setSaveEvent('jumpToProject');
          setModalVisible(true);
        } else {
          jumpToProject();
        }
        changeTreeTab('process');
      },
    },
    {
      title: '编辑',
      disabled: true,
    },
    {
      title: '运行',
      disabled: true,
    },
    {
      title: '调试',
      disabled: true,
    },
    {
      title: '工具',
      disabled: true,
    },
    {
      title: '帮助',
      onClick: () => {
        setHelpModelVisible(true);
      },
    },
  ];

  const signOut = () => {
    if (!globalUserName) {
      // 离线模式
      ipcRenderer.send('signOut');
      return true;
    }
    axios
      .get(api('signOut'))
      .then(res => res.data)
      .then(json => {
        if (~json.code) {
          ipcRenderer.send('signOut');
          return true;
        }
        return false;
      })
      .catch(err => console.log(err));
  };

  const handleSignOut = () => {
    modifiedNodesArr.current = getModifiedNodes(processTree);
    if (modifiedNodesArr.current.length !== 0) {
      setSaveEvent('exit');
      setModalVisible(true);
    } else {
      signOut();
    }
  };

  const handleCancel = () => {
    setHelpModelVisible(false);
  };

  const handleSaveModelCancelOk = () => {
    if (saveEvent === 'jumpToProject') {
      jumpToProject();
    } else if (saveEvent === 'close') {
      handleWindowOperation('close');
    } else if (saveEvent === 'exit') {
      signOut();
    }
  };

  const handleSaveModelOk = () => {
    if (saveEvent === 'jumpToProject') {
      jumpToProject();
    } else if (saveEvent === 'close') {
      setTimeout(() => {
        handleWindowOperation('close');
      }, 100);
    } else if (saveEvent === 'exit') {
      signOut();
    }
  };

  /****
   * DEBUG!!!
   *
   */

  const currentPagePosition = useSelector(
    state => state.temporaryvariable.currentPagePosition
  );

  // 用来管理pythonDebug的状态
  const [pyDebugServerState, setPyDebugServerState] = useState({
    type: '启动debug模式',
    tagColor: 'cyan',
  });

  const handleRunPythonDebugServerStart = msg => {
    switch (msg) {
      case '准备':
        return setPyDebugServerState({
          type: '启动debug模式',
          tagColor: 'cyan',
        });
      case '连接':
        localStorage.setItem('running_mode', 'started');
        setOnePause(false);
        return setPyDebugServerState({
          type: 'Debug已连接',
          tagColor: '',
        });
      case '终止':
        return setPyDebugServerState({
          type: 'Debug已终止',
          tagColor: 'orange',
        });
    }
  };

  // 逐步调试按钮
  const [pauseState, setPauseState] = useState({
    running: false,
    pause: false,
  });
  const [onePause, setOnePause] = useState(false);

  // 流程快代码转义
  const transformProcessToPython = useTransformProcessToPython();

  useEffect(() => {
    // event.addListener(
    //   PYTHOH_DEBUG_SERVER_START,
    //   handleRunPythonDebugServerStart
    // );

    // event.addListener(PYTHOH_DEBUG_BLOCK_ALL_RUN_PAUSE, setContinueBtn);
    // event.addListener(`one_started`, disabledBtn);
    // event.addListener(`one_finished`, abledBtn);
    // event.addListener(PYTHOH_DEBUG_BLOCK_ALL_RUN_END, setPuseBtn);

    // *新版DEBUG
    event.addListener(DEBUG_OPEN_DEBUGSERVER, debug_switch_open);
    event.addListener(DEBUG_CLOSE_DEBUGSERVER, debug_switch_close);
    event.addListener(DEBUG_RUN_BLOCK_ALL_RUN, debug_run_block_all_run);

    return () => {
      // event.removeListener(
      //   PYTHOH_DEBUG_SERVER_START,
      //   handleRunPythonDebugServerStart
      // );
      // event.removeListener(`one_started`, disabledBtn);
      // event.removeListener(`one_finished`, abledBtn);
      // event.removeListener(PYTHOH_DEBUG_BLOCK_ALL_RUN_END, setPuseBtn);

      // *新版DEBUG
      event.removeListener(DEBUG_OPEN_DEBUGSERVER, debug_switch_open);
      event.removeListener(DEBUG_CLOSE_DEBUGSERVER, debug_switch_close);
      event.removeListener(DEBUG_RUN_BLOCK_ALL_RUN, debug_run_block_all_run);

      localStorage.setItem('debug', '关闭');
      // 当返回时，自动杀死debug进程
      killTask();
    };
  }, []);

  // *新版DEBUG
  // 开关
  const debug_switch = useSelector(state => state.debug.switch);
  const debug_switch_ref = useRef();
  debug_switch_ref.current = debug_switch;
  // 暂停
  const debug_pause = useSelector(state => state.debug.pause);
  // 数据仓库
  const debug_dataStore = useSelector(state => state.debug.dataStore);
  // DEBUG服务是否启动

  // 01 启动DEBUG服务
  const debug_switch_open = () => {
    if (debug_switch_ref.current === false) {
      runDebugServer();
    } else {
      message.info('已开启...');
    }
  };

  // 02 关闭DEBUG服务
  const debug_switch_close = () => {
    if (debug_switch_ref.current === true) {
      killTask();
    } else {
      message.info('稍等，正在关闭中...');
    }
  };

  // 03 流程图级的按序调试
  const debug_run_block_all_run = () => {
    changeDebugInfos(DEBUG_RUN_BLOCK_ALL_RUN, {});
    console.log(transformProcessToPython());
    console.log(`缓存代码池\n`, getTempCenter());
  };

  const setPuseBtn = () => {
    setPauseState({
      running: false,
      pause: true,
    });
  };

  const disabledBtn = () => {
    setOnePause(true);
  };

  const abledBtn = () => {
    setOnePause(false);
  };

  useEffect(() => {
    if (!pauseState.running) return;
    resetPythonCode();
    message.info(
      '由于切换了层级，已重新生成当前页的代码,并将指针指向第一条',
      'resetPythonCode'
    );
  }, [currentPagePosition]);

  const resetPythonCode = () => {
    if (currentPagePosition === 'editor') {
      //setPauseState({ running: true, pause: false });
      console.log(transformProcessToPython());
      console.log(getTempCenter());
      localStorage.setItem('running_mode', 'blockAll_running');
      //event.emit(PYTHOH_DEBUG_BLOCK_ALL_RUN);
    } else if (currentPagePosition === 'block') {
      //setPauseState({ running: true, pause: false });
      console.log(transformProcessToPython());
      console.log(getTempCenter());
      localStorage.setItem('running_mode', 'cardsAll_running');
      //event.emit(PYTHOH_DEBUG_CARDS_ALL_RUN);
    }
    message.info(
      '已重新生成当前页的代码,并将指针指向第一条',
      'resetPythonCode'
    );
  };

  const setContinueBtn = () => {
    setPauseState({ running: true, pause: true });
  };

  return (
    <div
      className="graphblock-header"
      style={{
        WebkitAppRegion: 'drag',
      }}
      onDoubleClick={() => {
        handleWindowOperation('unmaximize');
      }}
    >
      <div
        className="graphblock-header-tools"
        style={{
          WebkitAppRegion: 'no-drag',
          display: tag === 'recentProject' ? 'none' : '',
        }}
      >
        {TOOLS_DESCRIPTION.map((tool, index) => {
          if (typeof tool === 'object' && tool.children) {
            return (
              <Dropdown
                key={index}
                overlay={generateMenu(tool.children || [])}
                placement="bottomLeft"
              >
                <span>{tool.title}</span>
              </Dropdown>
            );
          }
          if (typeof tool === 'object') {
            return (
              <Fragment key={index}>
                <span
                  className={tool.disabled ? 'item-disabled' : ''}
                  onClick={tool.onClick || (() => {})}
                >
                  {tool.title}
                </span>
                {tool.title === '帮助' && !tool.disabled ? (
                  <HelpModel
                    visible={helpModelVisible}
                    handleCancel={handleCancel}
                  />
                ) : null}
              </Fragment>
            );
          }
          return <span key={index}>{tool}</span>;
        })}
        <div
          className="debug-btn"
          style={{ WebkitAppRegion: 'no-drag', display: 'block' }}
        >
          <h5>状态 {debug_switch ? '开' : '关'} / </h5>

          <Tag
            color={pyDebugServerState.tagColor}
            className="debug-btn-inner"
            onClick={() => {
              if (pyDebugServerState.type === 'Debug已连接')
                return message.info('Debug已连接');
              if (pyDebugServerState.type === 'Debug已终止')
                return message.info('操作太快了，请稍等一会');
              event.emit('clear_output');
              runDebugServer();
            }}
          >
            {pyDebugServerState.type}
          </Tag>
          {pyDebugServerState.type === 'Debug已连接' ? (
            <>
              {pauseState.running === false && onePause === false ? (
                <Tag
                  color="lime"
                  className="debug-btn-inner"
                  onClick={() => {
                    if (currentPagePosition === 'editor') {
                      setPauseState({ running: true, pause: false });
                      console.log(transformProcessToPython());
                      console.log(getTempCenter());
                      localStorage.setItem('running_mode', 'blockAll_running');
                      event.emit(PYTHOH_DEBUG_BLOCK_ALL_RUN);
                    } else if (currentPagePosition === 'block') {
                      setPauseState({ running: true, pause: false });
                      console.log(transformProcessToPython());
                      console.log(getTempCenter());
                      localStorage.setItem('running_mode', 'cardsAll_running');
                      event.emit(PYTHOH_DEBUG_CARDS_ALL_RUN);
                    }
                  }}
                >
                  <Icon type="play-circle" />
                  {` `}按序调试
                </Tag>
              ) : (
                ''
              )}
              {onePause ? (
                <Tag color="purple" className="debug-btn-inner">
                  正在单步调试
                </Tag>
              ) : pauseState.running === true ? (
                pauseState.pause === true ? (
                  <>
                    <Tag
                      color="gold"
                      className="debug-btn-inner"
                      onClick={() => {
                        //testRunOneLine();
                        clearPause();
                        const running = localStorage.getItem('running_mode');
                        console.clear();
                        console.log(running);
                        if (
                          running === 'blockAll_pasue' ||
                          running === 'blockAll_running'
                        ) {
                          localStorage.setItem(
                            'running_mode',
                            'blockAll_running'
                          );
                          event.emit(PYTHOH_DEBUG_BLOCK_ALL_RUN);
                        }
                        if (
                          running === 'cardsAll_pause' ||
                          running === 'cardsAll_running'
                        ) {
                          console.log('!!!!');
                          localStorage.setItem(
                            'running_mode',
                            'cardsAll_running'
                          );
                          event.emit(PYTHOH_DEBUG_CARDS_ALL_RUN);
                        }
                        setPauseState({ running: true, pause: false });
                      }}
                    >
                      <Icon type="play-circle" />
                      {` `}继续
                    </Tag>
                    <Tag
                      color="green"
                      className="debug-btn-inner"
                      onClick={() => {
                        clearPause();
                        const running = localStorage.getItem('running_mode');
                        console.clear();
                        console.log(running);
                        if (
                          running === 'blockAll_pause' ||
                          running === 'blockAll_running'
                        ) {
                          localStorage.setItem(
                            'running_mode',
                            'blockAll_running'
                          );
                          event.emit(PYTHOH_DEBUG_BLOCK_ALL_RUN);
                        } else if (
                          running === 'cardsAll_pause' ||
                          running === 'cardsAll_running'
                        ) {
                          localStorage.setItem(
                            'running_mode',
                            'cardsAll_running'
                          );
                          event.emit(PYTHOH_DEBUG_CARDS_ALL_RUN);
                        }
                        setPause();
                        setPauseState({ running: true, pause: false });
                      }}
                    >
                      <Icon type="play-circle" />
                      {` `}下一步
                    </Tag>
                    <Tag
                      color="blue"
                      className="debug-btn-inner"
                      onClick={() => {
                        resetPythonCode();
                      }}
                    >
                      <Icon type="issues-close" />
                      {` `}
                      重新生成代码
                    </Tag>
                  </>
                ) : (
                  <Tag
                    color="purple"
                    className="debug-btn-inner"
                    onClick={() => {
                      //testRunOneLine();
                      console.log(setPause());
                      //setPauseState({ ...pauseState, pause: true });
                    }}
                  >
                    <Icon type="pause-circle" />
                    {` `}暂停
                  </Tag>
                )
              ) : (
                ''
              )}

              <Tag
                color="volcano"
                className="debug-btn-inner"
                onClick={() => {
                  setPauseState({ running: false, pause: false });
                  killTask();
                }}
              >
                <Icon type="stop" />
                {` `}终止
              </Tag>
            </>
          ) : (
            ''
          )}
        </div>
      </div>
      <div
        className="graphblock-header-title"
        style={{
          marginLeft: tag === 'recentProject' ? 18 : 0,
        }}
      >
        SD-RPA Studio
      </div>
      <div
        className="graphblock-header-user"
        style={{
          WebkitAppRegion: 'no-drag',
        }}
      >
        {globalUserName && (
          <div className="graphblock-header-user-name">
            <Icon type="user" />
            <span>{globalUserName}, 您好!</span>
          </div>
        )}
        <span
          className="graphblock-header-user-sign-out"
          onClick={handleSignOut}
        >
          退出
        </span>
        <Icon
          type="minus"
          className="graphblock-header-operation"
          onClick={() => handleWindowOperation('min')}
        />
        <Icon
          type="fullscreen"
          className="graphblock-header-operation"
          onClick={() => handleWindowOperation('max')}
        />
        <Icon
          type="close"
          className="graphblock-header-operation"
          onClick={() => {
            modifiedNodesArr.current = getModifiedNodes(processTree);
            if (modifiedNodesArr.current.length !== 0) {
              setSaveEvent('close');
              setModalVisible(true);
            } else {
              handleWindowOperation('close');
            }
          }}
        />
      </div>
      {visible === 'newproject' && (
        <NewProject resetVisible={resetVisible} tag="new" />
      )}
      {visible === 'openproject' && (
        <NewProject resetVisible={resetVisible} tag="open" />
      )}
      <SaveConfirmModel
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        type="saveAll"
        modifiedNodes={modifiedNodesArr.current}
        onCancelOk={handleSaveModelCancelOk}
        onOk={handleSaveModelOk}
      />
    </div>
  );
});
