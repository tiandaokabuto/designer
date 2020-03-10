import React, { useState } from 'react';
import { Icon, Dropdown, Menu } from 'antd';
import axios from 'axios';

import NewProject from './NewProject';
import api from '../../../api';
const { ipcRenderer } = require('electron');

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

export default () => {
  const [visible, setVisible] = useState(undefined);
  const resetVisible = () => {
    setVisible(undefined);
  };
  const TOOLS_DESCRIPTION = [
    {
      title: '项目',
      children: [
        {
          title: '新建目录',
          onClick: () => {
            setVisible('newproject');
          },
        },
        {
          title: '打开目录',
          onClick: () => {
            setVisible('openproject');
          },
        },
      ],
    },
    '编辑',
    '运行',
    '调试',
    '工具',
    '帮助',
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
      <div className="graphblock-header-tools">
        {TOOLS_DESCRIPTION.map((tool, index) => {
          if (typeof tool === 'object') {
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
          return <span key={index}>{tool}</span>;
        })}
      </div>
      <div className="graphblock-header-title">SD-RPA Studio</div>
      <div className="graphblock-header-user">
        <Icon type="user" />
        <span>韩冬冬, 您好!</span>
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
          onClick={() => handleWindowOperation('close')}
        />
      </div>
      {visible === 'newproject' && (
        <NewProject resetVisible={resetVisible} tag="new" />
      )}
      {visible === 'openproject' && (
        <NewProject resetVisible={resetVisible} tag="open" />
      )}
    </div>
  );
};
