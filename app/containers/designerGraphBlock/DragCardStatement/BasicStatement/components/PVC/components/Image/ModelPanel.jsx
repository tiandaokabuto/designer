import React from "react";
import { Image } from "antd";
import {
  CloudUploadOutlined,
  CloudDownloadOutlined,
  DeleteOutlined,
  VerticalAlignBottomOutlined,
  VerticalAlignTopOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import "../public.less";
import { DOWNLOAD_COMPONENT } from "../componentTypes";

import "./image.less";

const ImageComponent = (props) => {
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

  const getRealPath = (path) =>{
    let realPath = '';
    realPath += path;
    realPath = realPath.replace(/'/g,'').replace(/"/g,'')
    return realPath;
  }

  return (
    <div style={{ flexBasis: width }} className="panel-content-row-col">
      <div
        className={`pvc-image component-contain ${
          focusItemId === item.id ? "item-selected" : ""
        }`}
        onClick={() => setFocusItemId(item.id)}
      >
        <div
          className="pvc-input-label"
          style={{
            display: item.attribute.label ? "block" : "none",
          }}
        >
          <PictureOutlined /> {item.attribute.label}
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
          {/^['"]+http[s]*:/.test(item.attribute.value) ||
          /^['"]+data:/.test(item.attribute.value)
          ? (
            <img src={/^['"]*/.test(item.attribute.value) ? getRealPath(item.attribute.value) : item.attribute.value} />
          ) : (
            <div className="demo-pic">
              示例图片
              <br />
              {item.attribute.width}%<br />
              <span>以http或data的图片可预览</span>
              <br />
            </div>
          )}
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

        <div
          className="delete-component-btn"
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
      </div>
    </div>
  );
};
export default ImageComponent;
