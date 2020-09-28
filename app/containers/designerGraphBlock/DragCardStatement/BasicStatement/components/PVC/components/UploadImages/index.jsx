import React from "react";
import { Image } from "antd";
import {
  CloudUploadOutlined,
  CloudDownloadOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  FileImageOutlined,
} from "@ant-design/icons";
import "../public.less";
import { DOWNLOAD_COMPONENT } from "../componentTypes";

import "./uploadImages.less";

const UploadImagesComponent = (props) => {
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

  return (
    <div style={{ flexBasis: width }} className="panel-content-row-col">
      <div
        className={`pvc-upload-images component-contain ${
          focusItemId === item.id ? "item-selected" : ""
        }`}
        onClick={() => setFocusItemId(item.id)}
      >
        <div className="pvc-input-label">
          <FileImageOutlined /> {item.attribute.label}
        </div>

        <div
          className="pvc-input-desc"
          style={{
            display: item.attribute.desc ? "block" : "none",
          }}
        >
          {item.attribute.desc}
        </div>

        <div style={{ textAlign: "center" }}>
          {/* {item.attribute.value
                        ? item.attribute.value.map((subImg, index) => {
                              return <img width={100} src={item} />;
                          })
                        : ''} */}

          <div className="demo-pic">
            + 添加图片 1
            <br />
            <span>显示值处填入图片地址列表</span>
            <br />
          </div>
          <div className="demo-pic-2">
            + 图片 2, 3, 4 ...
            <br />
            <span>+ 等更多图片</span>
            <br />
          </div>
        </div>
        <div
          className="delete-component-btn "
          style={{
            display: focusItemId === item.id ? "block" : "none",
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteComponent(item.id);
          }}
        >
          <DeleteOutlined />
        </div>
        <div
          className="move-component-btn-up"
          style={{ display: focusItemId === item.id ? "block" : "none" }}
          onClick={() => {
            item.float = "left";
            moveUp(focusItemId);
          }}
        >
          <ArrowUpOutlined />
        </div>
        <div
          className="move-component-btn-down"
          style={{ display: focusItemId === item.id ? "block" : "none" }}
          onClick={() => {
            item.float = "left";
            moveDown(focusItemId);
          }}
        >
          <ArrowDownOutlined />
        </div>
      </div>
    </div>
  );
};
export default UploadImagesComponent;
