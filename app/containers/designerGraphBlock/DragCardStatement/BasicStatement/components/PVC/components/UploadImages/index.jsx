import React from 'react';
import { Image } from 'antd';
import {
  CloudUploadOutlined,
  CloudDownloadOutlined,
  DeleteOutlined,
  VerticalAlignBottomOutlined,
  VerticalAlignTopOutlined,
} from '@ant-design/icons';
import '../public.less';
import { DOWNLOAD_COMPONENT } from '../componentTypes';

const UploadImagesComponent = props => {
  let {
    item,
    setDataList,
    handleDeleteComponent,
    focusItemId,
    setFocusItemId,
    moveUp,
    moveDown,
  } = props;

  return (
    <div
      style={{ flexBasis: `${item.attribute.width}%` }}
      className="panel-content-row-col"
    >
      <div
        className={`component-contain ${
          focusItemId === item.id ? 'item-selected' : ''
        }`}
        onClick={() => setFocusItemId(item.id)}
      >
        <div>{item.attribute.label}</div>
        <div style={{ textAlign: 'center' }}>
          {/* {item.attribute.value
                        ? item.attribute.value.map((subImg, index) => {
                              return <img width={100} src={item} />;
                          })
                        : ''} */}
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
          className="move-component-btn"
          style={{
            position: 'absolute',
            top: 0,
            right: 24,
            display: focusItemId === item.id ? 'block' : 'none',
          }}
          onClick={() => {
            item.float = 'left';
            moveUp(focusItemId);
          }}
        >
          <VerticalAlignTopOutlined />
        </div>
        <div
          className="move-component-btn"
          style={{
            position: 'absolute',
            top: 0,
            right: 48,
            display: focusItemId === item.id ? 'block' : 'none',
          }}
          onClick={() => {
            item.float = 'left';
            moveDown(focusItemId);
          }}
        >
          <VerticalAlignBottomOutlined />
        </div>
      </div>
    </div>
  );
};
export default UploadImagesComponent;
