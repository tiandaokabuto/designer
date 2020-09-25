import './index.scss';
import React, { useState, Fragment, useRef, memo, useEffect } from 'react';
import { Icon, Dropdown, Menu, Tag, message } from 'antd';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import NewProject from './NewProject';
import api from '../../../api';
import {
  getModifiedNodes,
  getDecryptOrNormal,
  getChooseFilePath,
} from '_utils/utils';
import { changeTreeTab } from '../../reduxActions/index';
import HelpModel from './HelpModel';
import ShortcutModel from './ShortcutModel';
import usePersistentStorage from '../DragEditorHeader/useHooks/usePersistentStorage';
import SaveConfirmModel from '../../designerGraphEdit/GraphItem/components/SaveConfirmModel';
import {
  UNDO_CARDSDATA,
  REDO_CARDSDATA,
  CHANGE_FORCEUPDATE_TAG,
} from '../../../constants/actions/codeblock';
import { encrypt } from '../../../login/utils';
// *新 DEBUG liuqi
import { useTransformProcessToPython } from '../../designerGraphEdit/useHooks';
import {
  getTempCenter,
  setPause,
  clearPause,
  // handleDebugBlockAllRun,
  // handleDebugCardsAllRun,
  blockRun_0_2_ver,
  cardsRun_0_2_ver,
} from '../../designerGraphEdit/RPAcore';
import {
  runDebugServer,
  runAllStepByStepAuto,
  killTask,
} from '../../../utils/DebugUtils/runDebugServer';
import { clickOneStepRun } from '../../../utils/DebugUtils/clickOneStepRun';
// import event from '../../eventCenter';
import event, {
  SHOW_EXPORT_MODAL,
  REVOKE_ACTION,
  RECOVERY_ACTION,
  CUT_COMMAND,
  COPY_COMMAND,
  PASTE_COMMAND,
  DELETE_COMMAND,
  RELEASE_PROCESS_COMMAND,
} from '@/containers/eventCenter';
import {
  CHANGE_DEBUG_INFOS,
  DEBUG_RESET_ALL_INFO,
  DEBUG_OPEN_DEBUGSERVER,
  DEBUG_CLOSE_DEBUGSERVER,
  DEBUG_RUN_STEP_BY_STEP,
  //
  DEBUG_SET_PAUSE,
  DEBUG_CONTINUE,
  DEBUG_CONTINUE_ONESTEP_NEXT,
  DEBUG_RESET_CODE,
  DEBUG_ONE_STEP,
  //
  DEBUG_RUN_BLOCK_ALL_RUN,
  DEBUG_RUN_BLOCK_CHANGE_STATE_RUNNING,
  DEBUG_RUN_BLOCK_CHANGE_STATE_END,
  //
  DEBUG_RUN_CARDS_ALL_RUN,
  DEBUG_RUN_CARDS_CHANGE_STATE_RUNNING,
  DEBUG_RUN_CARDS_CHANGE_STATE_END,
  //
  DEBUG_SET_BTN_CAN_BE_PASUE,
  //
  DEBUG_ONE_STEP_RUN_BLOCK,
  DEBUG_ONE_STEP_RUN_CARDS,
  DEBUG_ONE_STEP_RUN_STARTED,
  DEBUG_ONE_STEP_FINISHED,
  DEBUG_ONE_STEP_FINISHED_BLOCK,
  DEBUG_ONE_STEP_FINISHED_CARDS,
  DEBUG_ONE_STEP_FINISHED_STARTED,
} from '../../../constants/actions/debugInfos';
import { changeDebugInfos } from '../../reduxActions';
import { fetchCard } from '../../../utils/DebugUtils/fetchCard';

import { generateMenu, TOOLS } from './Menu/index';
import { RELEASE_PROCESS } from '../../eventCenter/index';
const { ipcRenderer, remote } = require('electron');
const { SubMenu } = Menu;
const fs = require('fs');
const process = require('process');

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
  const [shortcutModelVisible, setShortcutModelVisible] = useState(false);
  const [saveEvent, setSaveEvent] = useState('');
  const globalUserName = remote.getGlobal('sharedObject').userName;

  const dispatch = useDispatch();
  const forceUpdateTag = useSelector(state => state.blockcode.forceUpdateTag);

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
  // 开关
  const debug_switch = useSelector(state => state.debug.switch);
  const debug_switch_ref = useRef();
  debug_switch_ref.current = debug_switch;
  // 暂停
  const debug_pause = useSelector(state => state.debug.pause);
  // 运行中状态
  const debug_runningState = useSelector(state => state.debug.runningState);
  const debug_runningState_ref = useRef();
  debug_runningState_ref.current = debug_runningState;

  // 数据仓库
  const debug_dataStore = useSelector(state => state.debug.dataStore);
  // 当前选中的流程块
  const checkedGraphBlockId = useSelector(
    state => state.grapheditor.checkedGraphBlockId
  );
  const checkedGraphBlockId_ref = useRef();
  checkedGraphBlockId_ref.current = checkedGraphBlockId;
  // 当前层级
  const currentPagePosition = useSelector(
    state => state.temporaryvariable.currentPagePosition
  );
  const currentPagePosition_ref = useRef();
  currentPagePosition_ref.current = currentPagePosition;

  // 树改变时
  const currentCheckedTreeNode = useSelector(
    state => state.grapheditor.currentCheckedTreeNode
  );

  // const TOOLS_DESCRIPTION = TOOLS;
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
      // disabled: true,
      children: [
        {
          title: '剪切',
          shortcut: 'CTRL+X',
          onClick: () => {
            handleCut();
          },
        },
        {
          title: '复制',
          shortcut: 'CTRL+C',
          onClick: () => {
            handleCopy();
          },
        },
        {
          title: '粘贴',
          shortcut: 'CTRL+V',
          onClick: () => {
            handlePaste();
          },
        },
        {
          title: '删除',
          shortcut: 'Delete',
          onClick: () => {
            handleDelete();
          },
        },
        {
          title: '撤销',
          shortcut: 'CTRL+Z',
          onClick: () => {
            handleRevoke();
          },
        },
        {
          title: '恢复',
          shortcut: 'CTRL+Y',
          onClick: () => {
            handleRecovery();
          },
        },
      ],
    },
    {
      title: '工具',
      children: [
        {
          title: '流程',
          subMenu: [
            {
              title: '导入',
              disabled: currentPagePosition_ref.current === 'block',
              onClick: () => {
                ipcRenderer.removeAllListeners('chooseItem');
                ipcRenderer.send(
                  'choose-directory-dialog',
                  'showOpenDialog',
                  '选择',
                  ['openFile']
                );
                ipcRenderer.on('chooseItem', (e, filePath) => {
                  getChooseFilePath(filePath, 'process');
                });
              },
            },
            {
              title: '导出',
              disabled: currentPagePosition_ref.current === 'block',
              onClick: () => {
                event.emit(SHOW_EXPORT_MODAL);
              },
            },
            {
              title: '发布',
              disabled:
                globalUserName === '' ||
                currentPagePosition_ref.current === 'block',
              onClick: () => {
                event.emit(RELEASE_PROCESS_COMMAND);
              },
            },
          ],
        },
        {
          title: '流程块',
          subMenu: [
            {
              title: '导入',
              onClick: () => {
                ipcRenderer.removeAllListeners('chooseItem');
                ipcRenderer.send(
                  'choose-directory-dialog',
                  'showOpenDialog',
                  '选择',
                  ['openFile']
                );
                ipcRenderer.on('chooseItem', (e, filePath) => {
                  getChooseFilePath(filePath, 'processModule');
                });
              },
            },
            // {
            //   title: '导出',
            //   onClick: () => {
            //     console.log('导出');
            //   },
            // },
          ],
        },
      ],
    },
    {
      title: '帮助',
      children: [
        {
          title: '新手教程',
          disabled: true,
          onClick: () => {
            console.log('新手教程');
          },
        },
        {
          title: '快捷键说明',
          onClick: () => {
            setShortcutModelVisible(true);
          },
        },
        {
          title: '安装扩展',
          disabled: true,
          onClick: () => {
            console.log('安装扩展');
          },
        },
        {
          title: '打开控制台',
          onClick: () => {
            handleOpenControl();
          },
        },
        {
          title: '关于',
          onClick: () => {
            setHelpModelVisible(true);
          },
        },
      ],
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

  // 打开控制台
  const handleOpenControl = () => {
    const data = JSON.parse(
      encrypt.argDecryptByDES(
        fs.readFileSync(`${process.cwd()}/globalconfig/login.json`, {
          encoding: 'utf-8',
        })
      )
    );
    let url = 'https://' + data.ip + ':44388/sd_rpa/login';
    if (data.offLine === false) {
      url =
        'https://' +
        data.ip +
        ':44388/sd_rpa/login?uid=' +
        fs.readFileSync(`${process.cwd()}/globalconfig/login.json`, {
          encoding: 'utf-8',
        });
    }
    ipcRenderer.removeAllListeners('open_control');
    ipcRenderer.send('open_control', url);
  };

  const handleCancel = () => {
    setHelpModelVisible(false);
    setShortcutModelVisible(false);
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

  // 处理撤销事件
  const handleRevoke = () => {
    if (currentPagePosition_ref.current === 'editor') {
      event.emit('undo');
    } else if (currentPagePosition_ref.current === 'block') {
      console.log('第二层撤销');
      dispatch({
        type: CHANGE_FORCEUPDATE_TAG,
        payload: !forceUpdateTag,
      });
      dispatch({
        type: UNDO_CARDSDATA,
      });
    }
  };
  // 处理恢复事件
  const handleRecovery = () => {
    if (currentPagePosition_ref.current === 'editor') {
      event.emit('redo');
    } else if (currentPagePosition_ref.current === 'block') {
      dispatch({
        type: CHANGE_FORCEUPDATE_TAG,
        payload: !forceUpdateTag,
      });
      dispatch({
        type: REDO_CARDSDATA,
      });
    }
  };
  // 处理复制事件
  const handleCopy = () => {
    if (currentPagePosition_ref.current === 'editor') {
      event.emit('copyProcess');
      return;
    } else if (currentPagePosition_ref.current === 'block') {
      event.emit(COPY_COMMAND);
    }
  };
  // 处理粘贴事件
  const handlePaste = () => {
    if (currentPagePosition_ref.current === 'editor') {
      event.emit('pasteProcess');
      return;
    } else if (currentPagePosition_ref.current === 'block') {
      event.emit(PASTE_COMMAND);
    }
  };

  // 处理剪切事件
  const handleCut = () => {
    if (currentPagePosition_ref.current === 'editor') {
      message.info('没有剪切目标');
      return;
    } else if (currentPagePosition_ref.current === 'block') {
      event.emit(CUT_COMMAND);
    }
  };
  // 处理删除事件
  const handleDelete = () => {
    if (currentPagePosition_ref.current === 'editor') {
      event.emit('deleteProcess');
      return;
    } else if (currentPagePosition_ref.current === 'block') {
      event.emit(DELETE_COMMAND);
    }
  };

  // 逐步调试按钮
  const [pauseState, setPauseState] = useState({
    running: false,
    pause: false,
  });
  const [onePause, setOnePause] = useState(false);

  // *新版DEBUG
  //
  // 按钮在下侧面板中，由于下侧面板没有办法长时间驻留
  // 所以DEBUG的服务器保持在菜单栏
  //
  // 1.DEBUG服务器随着跳转到项目界面，会销毁
  // 2.DEBUG服务器不会因为切换块级而销毁，但是生成的代码和指针会充值
  //

  // 流程快代码转义
  const transformProcessToPython = useTransformProcessToPython();

  useEffect(() => {
    event.addListener(DEBUG_OPEN_DEBUGSERVER, debug_switch_open);
    event.addListener(DEBUG_CLOSE_DEBUGSERVER, debug_switch_close);
    event.addListener(DEBUG_RUN_STEP_BY_STEP, debug_run_stepByStep);
    event.addListener(DEBUG_RUN_BLOCK_ALL_RUN, debug_continueRun_Block);
    event.addListener(DEBUG_RUN_CARDS_ALL_RUN, debug_continueRun_Cards);
    event.addListener(DEBUG_SET_PAUSE, debug_setPause);
    event.addListener(DEBUG_CONTINUE, debug_continue);
    event.addListener(
      DEBUG_CONTINUE_ONESTEP_NEXT,
      debug_continueRun_oneStep_next
    );
    event.addListener(DEBUG_RESET_CODE, resetPythonCode);
    event.addListener(DEBUG_ONE_STEP, oneStepRun);
    event.addListener(DEBUG_ONE_STEP_FINISHED, oneStepFinished);
    // 添加撤销恢复监听
    event.addListener(REVOKE_ACTION, handleRevoke);
    event.addListener(RECOVERY_ACTION, handleRecovery);

    return () => {
      event.removeListener(DEBUG_OPEN_DEBUGSERVER, debug_switch_open);
      event.removeListener(DEBUG_CLOSE_DEBUGSERVER, debug_switch_close);
      event.removeListener(DEBUG_RUN_STEP_BY_STEP, debug_run_stepByStep);
      event.removeListener(DEBUG_RUN_BLOCK_ALL_RUN, debug_continueRun_Block);
      event.removeListener(DEBUG_RUN_CARDS_ALL_RUN, debug_continueRun_Cards);
      event.removeListener(DEBUG_SET_PAUSE, debug_setPause);
      event.removeListener(DEBUG_CONTINUE, debug_continue);
      event.removeListener(
        DEBUG_CONTINUE_ONESTEP_NEXT,
        debug_continueRun_oneStep_next
      );
      event.removeListener(DEBUG_RESET_CODE, resetPythonCode);
      event.removeListener(DEBUG_ONE_STEP, oneStepRun);
      event.removeListener(DEBUG_ONE_STEP_FINISHED, oneStepFinished);
      event.removeListener(REVOKE_ACTION, handleRevoke);
      event.removeListener(RECOVERY_ACTION, handleRecovery);

      // 当返回时，自动杀死debug进程
      killTask();
    };
  }, []);

  // 切换树时，直接挂掉debug
  useEffect(() => {
    killTask();
  }, [currentCheckedTreeNode]);

  // 切换层级时，刷新debug代码
  useEffect(() => {
    if (debug_switch_ref.current) {
      getTreeData();
    }
  }, [currentPagePosition]);

  // 00 切换层级时，则重置代码
  useEffect(() => {
    if (!debug_switch) return;
    resetPythonCode();
  }, [currentPagePosition]);

  // 00-1 重置代码
  const resetPythonCode = () => {
    if (currentPagePosition_ref.current === 'editor') {
      console.log(transformProcessToPython());
      console.log(getTempCenter());
      changeDebugInfos(DEBUG_RUN_BLOCK_CHANGE_STATE_END);
    } else if (currentPagePosition_ref.current === 'block') {
      console.log(transformProcessToPython());
      console.log(getTempCenter());
      changeDebugInfos(DEBUG_RUN_CARDS_CHANGE_STATE_END);
    }
    message.info('已重新生成当前页的代码,并将指针指向第一条');
  };

  // 01 启动DEBUG服务
  const debug_switch_open = () => {
    if (debug_switch_ref.current === false) {
      runDebugServer();
      getTreeData();
    } else {
      message.info('已开启...');
    }
  };

  // 刷新底部debug显示
  const getTreeData = () => {
    try {
      console.log(transformProcessToPython());
      console.log(getTempCenter());
    } catch (e) {
      console.log(e);
    }
  };

  // 02 关闭DEBUG服务
  const debug_switch_close = () => {
    if (debug_switch_ref.current === true) {
      killTask();
      // 恢复原有的所有配置
      changeDebugInfos(DEBUG_RESET_ALL_INFO, {});
    } else {
      message.info('稍等，正在关闭中...');
    }
  };

  // 03 流程图级的按序调试
  const debug_run_stepByStep = () => {
    console.log(transformProcessToPython());
    console.log(`缓存代码池\n`, getTempCenter());

    // 块级运行
    if (currentPagePosition_ref.current === 'editor') {
      changeDebugInfos(DEBUG_SET_BTN_CAN_BE_PASUE, {});
      changeDebugInfos(DEBUG_RUN_BLOCK_CHANGE_STATE_RUNNING); // 'blockAll_running'
      // handleDebugBlockAllRun();
      blockRun_0_2_ver(blockRun_0_2_ver)
    }
    // 原子能力级运行
    else if (currentPagePosition_ref.current === 'block') {
      changeDebugInfos(DEBUG_SET_BTN_CAN_BE_PASUE, {});
      changeDebugInfos(DEBUG_RUN_CARDS_CHANGE_STATE_RUNNING); // 'cardsAll_running'
      //handleDebugCardsAllRun(checkedGraphBlockId_ref.current);
      cardsRun_0_2_ver(checkedGraphBlockId_ref.current, cardsRun_0_2_ver);
    }
  };

  // 03-0 单点下一步
  const debug_continueRun_oneStep_next = () => {
    const running = debug_runningState_ref.current;

    clearPause();
    if (running === 'blockAll_pause') {
      changeDebugInfos(DEBUG_SET_BTN_CAN_BE_PASUE, {});
      changeDebugInfos(DEBUG_RUN_BLOCK_CHANGE_STATE_RUNNING); // 'blockAll_running'
      // handleDebugBlockAllRun();
      blockRun_0_2_ver(blockRun_0_2_ver)
    } else if (running === 'cardsAll_pause') {
      changeDebugInfos(DEBUG_SET_BTN_CAN_BE_PASUE, {});
      changeDebugInfos(DEBUG_RUN_CARDS_CHANGE_STATE_RUNNING); // 'cardsAll_running'
      //handleDebugCardsAllRun(checkedGraphBlockId_ref.current);
      cardsRun_0_2_ver(checkedGraphBlockId_ref.current, cardsRun_0_2_ver);
    }
    setPause();
  };

  // 03-1 继续下一步
  const debug_continueRun_Block = () => {
    // handleDebugBlockAllRun();
    blockRun_0_2_ver(blockRun_0_2_ver)
  };

  // 03-2 继续下一步
  const debug_continueRun_Cards = () => {
    //handleDebugCardsAllRun(checkedGraphBlockId_ref.current);
    cardsRun_0_2_ver(checkedGraphBlockId_ref.current, cardsRun_0_2_ver);
  };

  // 03-3 暂停
  const debug_setPause = () => {
    setPause();
  };

  // 03-4 继续
  const debug_continue = () => {
    clearPause();
    const running = debug_runningState_ref.current;
    console.log(running);
    if (running === 'blockAll_pasue' || running === 'blockAll_running') {
      changeDebugInfos(DEBUG_SET_BTN_CAN_BE_PASUE, {});
      changeDebugInfos(DEBUG_RUN_BLOCK_CHANGE_STATE_RUNNING);
      debug_continueRun_Block();
    }
    if (running === 'cardsAll_pause' || running === 'cardsAll_running') {
      changeDebugInfos(DEBUG_SET_BTN_CAN_BE_PASUE, {});
      changeDebugInfos(DEBUG_RUN_CARDS_CHANGE_STATE_RUNNING);
      debug_continueRun_Cards();
    }
    setPauseState({ running: true, pause: false });
  };

  // 04 单步发送
  const oneStepRun = data => {
    const { isIgnore, cards, id } = data;
    const running = debug_runningState_ref.current;

    if (debug_switch_ref.current === false) {
      return message.info('调试模式未打开');
    }

    if (running !== 'cardsAll_pause') {
      if (running !== 'blockAll_pause') {
        if (running !== 'started') {
          if (running !== 'feedom') {
            console.log(running);
            return message.info('非暂停时不能进行单步调试');
          }
        }
      }
    }
    if (running === 'blockAll_pause') {
      changeDebugInfos(DEBUG_ONE_STEP_RUN_BLOCK, {});
    } else if (running === 'cardsAll_pause') {
      changeDebugInfos(DEBUG_ONE_STEP_RUN_CARDS, {});
    } else if (running === 'started') {
      changeDebugInfos(DEBUG_ONE_STEP_RUN_STARTED, {});
    }

    const card = fetchCard(cards, id);
    console.log(`卡片`,card)
    clickOneStepRun(card, []);
  };

  // 05 单步结束
  const oneStepFinished = () => {
    const running = debug_runningState_ref.current;
    if (running === 'blockAll_one') {
      changeDebugInfos(DEBUG_ONE_STEP_FINISHED_BLOCK, {});
    } else if (running === 'cardsAll_one') {
      changeDebugInfos(DEBUG_ONE_STEP_FINISHED_CARDS, {});
    } else if (running === 'started_one') {
      changeDebugInfos(DEBUG_ONE_STEP_FINISHED_STARTED, {});
    }
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
              <Fragment key={index}>
                <Dropdown
                  key={index}
                  overlay={generateMenu(tool.children || [])}
                  placement="bottomLeft"
                >
                  <span>{tool.title}</span>
                </Dropdown>
                <HelpModel
                  visible={helpModelVisible}
                  handleCancel={handleCancel}
                />
                <ShortcutModel
                  visible={shortcutModelVisible}
                  handleCancel={handleCancel}
                />
              </Fragment>
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
              </Fragment>
            );
          }
          return <span key={index}>{tool}</span>;
        })}
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
