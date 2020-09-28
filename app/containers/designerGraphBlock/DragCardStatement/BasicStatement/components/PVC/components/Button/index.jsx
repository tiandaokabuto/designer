import React from "react";
import { Button } from "antd";
import {
  DeleteOutlined,
  VerticalAlignBottomOutlined,
  VerticalAlignTopOutlined,
  CheckCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import "../public.less";
import { CANCEL_COMPONENT } from "../componentTypes";

import "./button.less";

const SubmitButtonComponent = (props) => {
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
  let buttonValue = "提交";
  let buttonType = "primary";

  if (item.type === CANCEL_COMPONENT) {
    buttonValue = "取消";
    buttonType = "danger";
  }

  return (
    <div style={{ flexBasis: width }} className="panel-content-row-col">
      <div
        className={`pvc-btn component-contain ${
          focusItemId === item.id ? "item-selected" : ""
        }`}
        onClick={() => setFocusItemId(item.id)}
      >
        {/** 
        <div className="pvc-input-label"  style={{
            display: item.attribute.desc ? "block" : "none",
          }}>
          <CheckCircleOutlined /> {item.attribute.label}
        </div>
        */}
        <div style={{ textAlign: "left" }}>
          <Button className="pvc-btn-button" type={buttonType} block>
            {item.attribute.label}
          </Button>
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
export default SubmitButtonComponent;
