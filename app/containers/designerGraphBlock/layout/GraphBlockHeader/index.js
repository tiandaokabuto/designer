import React from 'react';
import { Icon } from 'antd';

import './index.scss';

const TOOLS_DESCRIPTION = ['文件', '编辑', '运行', '调试', '工具', '帮助'];

export default () => {
  return (
    <div
      className="graphblock-header"
      style={{
        '-webkitAppRegion': 'drag',
      }}
    >
      <div className="graphblock-header-tools">
        {TOOLS_DESCRIPTION.map((tool, index) => (
          <span key={index}>{tool}</span>
        ))}
      </div>
      <div className="graphblock-header-title">SD-RPA Studio</div>
      <div className="graphblock-header-user">
        <Icon type="user" />
        <span>韩冬冬, 您好!</span>
        <span className="graphblock-header-user-sign-out">退出</span>
        <Icon type="minus" className="graphblock-header-operation" />
        <Icon type="fullscreen" className="graphblock-header-operation" />
        <Icon type="close" className="graphblock-header-operation" />
      </div>
    </div>
  );
};
