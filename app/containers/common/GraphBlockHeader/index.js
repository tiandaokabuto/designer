import React, { useState } from 'react';
import { Icon, Dropdown, Menu, Modal } from 'antd';
import axios from 'axios';
import { useSelector } from 'react-redux';

import { ConfirmModal } from '../components';
import NewProject from './NewProject';
import api from '../../../api';
import { existModifiedNode, setAllModifiedState } from '../utils';
import usePersistentStorage from '../DragEditorHeader/useHooks/usePersistentStorage';
const { ipcRenderer, remote } = require('electron');

import './index.scss';

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

export default ({ history, tag }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const userName = remote.getGlobal('sharedObject').userName;
  const [visible, setVisible] = useState(undefined);
  const resetVisible = () => {
    setVisible(undefined);
  };
  const processTree = useSelector(state => state.grapheditor.processTree);
  const persistentStorage = usePersistentStorage();
  const TOOLS_DESCRIPTION = [
    {
      title: '项目',
      onClick: () => {
        history.push({
          pathname: '/',
          state: {
            jump: true,
          },
        });
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
      disabled: true,
    },
  ];
  const handleSignOut = () => {
    axios
      .get(api('signOut'))
      .then(res => res.data)
      .then(json => {
        if (~json.code) {
          ipcRenderer.send('signOut');
        }
      });
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
              <span
                className={tool.disabled ? 'item-disabled' : ''}
                key={index}
                onClick={tool.onClick || (() => {})}
              >
                {tool.title}
              </span>
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
        {userName && (
          <div className="graphblock-header-user-name">
            <Icon type="user" />
            <span>{userName}, 您好!</span>
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
            const flag = existModifiedNode(processTree);
            if (flag) {
              setModalVisible(true);
            } else {
              handleWindowOperation('close');
            }
            // if (flag) {
            //   Modal.confirm({
            //     content: '工作区内容尚未保存, 请确认是否保存?',
            //     onOk() {
            //       setAllModifiedState(processTree);
            //       persistentStorage();
            //       handleWindowOperation('close');
            //     },
            //     onCancel() {
            //       handleWindowOperation('close');
            //     },
            //   });
            // } else {
            //   handleWindowOperation('close');
            // }
            // handleWindowOperation('close')
          }}
        />
      </div>
      {visible === 'newproject' && (
        <NewProject resetVisible={resetVisible} tag="new" />
      )}
      {visible === 'openproject' && (
        <NewProject resetVisible={resetVisible} tag="open" />
      )}
      <ConfirmModal
        visible={modalVisible}
        content="请确认是否保存?"
        onCancel={() => {
          setModalVisible(false);
        }}
        onCancelOk={() => {
          handleWindowOperation('close');
        }}
        onOk={() => {
          setAllModifiedState(processTree);
          persistentStorage();
          setTimeout(() => {
            handleWindowOperation('close');
          }, 100);
        }}
      />
    </div>
  );
};
