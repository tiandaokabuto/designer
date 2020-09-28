import React from 'react';
import { Button } from 'antd';
import {
  CloudUploadOutlined,
  CloudDownloadOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import '../public.less';
import { DOWNLOAD_COMPONENT } from '../componentTypes';

import './upload.less';

const UploadComponent = props => {
  let {
    width,
    item,
    setDataList,
    handleDeleteComponent,
    focusItemId,
    setFocusItemId,
    moveUp,
    moveDown,
  } = props;

  let buttonValue = '上传';
  let iconType = <CloudUploadOutlined />;

  if (item.type === DOWNLOAD_COMPONENT) {
    buttonValue = '下载';
    iconType = <CloudDownloadOutlined />;
  }

  return (
    <div style={{ flexBasis: width }} className="panel-content-row-col">
      <div
        className={`pvc-upload component-contain ${
          focusItemId === item.id ? 'item-selected' : ''
        }`}
        onClick={() => setFocusItemId(item.id)}
      >
        <div
          className="pvc-input-desc"
          style={{
            display: item.attribute.desc ? 'block' : 'none',
          }}
        >
          {item.attribute.desc}
        </div>
        <div style={{ textAlign: 'center' }}>
          <Button type="primary" block shape="round">
            {iconType}
            {item.attribute.label}
          </Button>
        </div>
        <div
          className="delete-component-btn "
          style={{
            display: focusItemId === item.id ? 'block' : 'none',
          }}
          onClick={e => {
            e.stopPropagation();
            handleDeleteComponent(item.id);
          }}
        >
          <DeleteOutlined />
        </div>
        <div
          className="move-component-btn-up"
          style={{ display: focusItemId === item.id ? 'block' : 'none' }}
          onClick={() => {
            item.float = 'left';
            moveUp(focusItemId);
          }}
        >
          <ArrowUpOutlined />
        </div>
        <div
          className="move-component-btn-down"
          style={{ display: focusItemId === item.id ? 'block' : 'none' }}
          onClick={() => {
            item.float = 'left';
            moveDown(focusItemId);
          }}
        >
          <ArrowDownOutlined />
        </div>
      </div>
    </div>
  );
};
export default UploadComponent;
