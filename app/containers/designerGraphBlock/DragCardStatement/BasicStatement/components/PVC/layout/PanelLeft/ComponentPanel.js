import React, { useState } from 'react';
import { List } from 'antd';
import {
  FormOutlined,
  BuildOutlined,
  FileAddOutlined,
  SkinOutlined,
} from '@ant-design/icons';

import {
  inputType,
  imageType,
  uploadType,
  downloadType,
  selectType,
  uploadImgsType,
  submitType,
  cancelType,
} from '../../components/DefautlConfig';

const formComponentList = [inputType, selectType];
const beautyComponentList = [imageType];
const fileComponentList = [uploadType, downloadType, uploadImgsType];
const comandCompomentList = [submitType, cancelType];

export default ({ handleAddComponent }) => {
  return (
    <div className="panel-left-componentPanel">
      <p className="frontTag">
        <FormOutlined /> 表单组件
      </p>
      <List
        grid={{ gutter: 16, column: 2 }}
        dataSource={formComponentList}
        renderItem={item => (
          <List.Item>
            <div
              className="panel-add-btn"
              onClick={() => handleAddComponent(item)}
            >
              {item.icon}
              {item.attribute.label}
            </div>
          </List.Item>
        )}
      />
      <p className="frontTag">
        <BuildOutlined /> 按钮组件
      </p>
      <List
        grid={{ gutter: 16, column: 2 }}
        dataSource={comandCompomentList}
        renderItem={item => (
          <List.Item>
            {' '}
            <div
              className="panel-add-btn"
              onClick={() => handleAddComponent(item)}
            >
              {item.icon}
              {item.label}
            </div>
          </List.Item>
        )}
      />
      <p className="frontTag">
        <FileAddOutlined /> 文件组件
      </p>
      <List
        grid={{ gutter: 16, column: 2 }}
        dataSource={fileComponentList}
        renderItem={item => (
          <List.Item>
            <div
              className="panel-add-btn"
              onClick={() => handleAddComponent(item)}
            >
              {item.icon}
              {item.attribute.label}
            </div>
          </List.Item>
        )}
      />
      <p className="frontTag">
        <SkinOutlined /> 美化组件
      </p>
      <List
        grid={{ gutter: 16, column: 2 }}
        dataSource={beautyComponentList}
        renderItem={item => (
          <List.Item>
            <div
              className="panel-add-btn"
              onClick={() => handleAddComponent(item)}
            >
              {item.icon}
              {item.label}
            </div>
          </List.Item>
        )}
      />
    </div>
  );
};
