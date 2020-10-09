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

import {
  INPUT_COMPONENT,
  RADIO_COMPONENT,
  IMAGE_COMPONENT,
  SUBMIT_COMPONENT,
  UPLOAD_COMPONENT,
  DOWNLOAD_COMPONENT,
  SELECT_COMPONENT,
  UPLOADIMAMGS_COMPONENT,
  CANCEL_COMPONENT,
} from '../../components/componentTypes';

const formComponentList = [inputType, selectType];
const beautyComponentList = [imageType];
const fileComponentList = [downloadType, uploadImgsType]; //uploadType,
const comandCompomentList = [submitType, cancelType];

export default ({ handleAddComponent }) => {
  const getIcon = label => {
    switch (label) {
      case INPUT_COMPONENT:
        return (
          <img
            src={require('../../assets/input.svg')}
            className="pvc-btn-icon"
          />
        );
      case SELECT_COMPONENT:
        return (
          <img
            src={require('../../assets/selector.svg')}
            className="pvc-btn-icon"
          />
        );
      case IMAGE_COMPONENT:
        return (
          <img
            src={require('../../assets/image.svg')}
            className="pvc-btn-icon"
          />
        );
      case SUBMIT_COMPONENT:
        return (
          <img src={require('../../assets/btn.svg')} className="pvc-btn-icon" />
        );
      case CANCEL_COMPONENT:
        return (
          <img
            src={require('../../assets/error.svg')}
            className="pvc-btn-icon"
          />
        );
      case UPLOAD_COMPONENT:
        return (
          <img
            src={require('../../assets/upload.svg')}
            className="pvc-btn-icon"
          />
        );

      case UPLOADIMAMGS_COMPONENT:
        return (
          <img
            src={require('../../assets/imageUp.svg')}
            className="pvc-btn-icon"
          />
        );
      case DOWNLOAD_COMPONENT:
        return (
          <img
            src={require('../../assets/download.svg')}
            className="pvc-btn-icon"
          />
        );
    }
  };

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
              {getIcon(item.type)}
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
              {getIcon(item.type)}
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
              {getIcon(item.type)}
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
              {getIcon(item.type)}
              {item.label}
            </div>
          </List.Item>
        )}
      />
    </div>
  );
};
