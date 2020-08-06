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
import event, { PYTHOH_DEBUG_SERVER_START } from '../../eventCenter';
import {
  runDebugServer,
  testRunOneLine,
  killTask,
} from '../../../utils/DebugUtils/runDebugServer';

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
        return setPyDebugServerState({
          type: 'Debug已连接',
          tagColor: 'green',
        });
      case '终止':
        return setPyDebugServerState({
          type: 'Debug已终止',
          tagColor: 'orange',
        });
    }
  };

  useEffect(() => {
    event.addListener(
      PYTHOH_DEBUG_SERVER_START,
      handleRunPythonDebugServerStart
    );
    return () => {
      event.removeListener(
        PYTHOH_DEBUG_SERVER_START,
        handleRunPythonDebugServerStart
      );
      localStorage.setItem('debug', '关闭');
      // 当返回时，自动杀死debug进程
      killTask();
    };
  }, []);

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
          <Tag
            color={pyDebugServerState.tagColor}
            className="debug-btn-inner"
            onClick={() => {
              if (pyDebugServerState.type === 'Debug已连接')
                return message.info('Debug已连接');
              runDebugServer();
            }}
          >
            {pyDebugServerState.type}
          </Tag>
          {pyDebugServerState.type === 'Debug已连接' ? (
            <span>
              <Tag
                color="cyan"
                className="debug-btn-inner"
                onClick={() => {
                  testRunOneLine();
                }}
              >
                <Icon type="play-circle" />
              </Tag>
              <Tag color="cyan" className="debug-btn-inner">
                <Icon type="pause-circle" />
              </Tag>
              <Tag
                color="cyan"
                className="debug-btn-inner"
                onClick={() => killTask()}
              >
                <Icon type="stop" />
              </Tag>
            </span>
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
