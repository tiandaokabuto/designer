import React, { useState, useEffect } from "react";
import { Input, Divider, Alert } from "antd";
import {
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  FormOutlined,
} from "@ant-design/icons";
import "../public.less";
import "./input.less";

const InputComponent = ({
  width,
  item,
  setDataList,
  handleDeleteComponent,
  focusItemId,
  setFocusItemId,
  moveUp,
  moveDown,
}) => {
  console.log(item.attribute.width);
  return (
    <div
      style={{ flexBasis: width }}
      //`${item.attribute.width}%`
      className="panel-content-row-col"
    >
      <div
        className={`pvc-input component-contain ${
          focusItemId === item.id ? "item-selected" : ""
        }`}
        onClick={() => setFocusItemId(item.id)}
      >
        <div className="pvc-input-label">
          <FormOutlined /> {item.attribute.label}
          <span
            style={{
              display: item.required ? "" : "none",
              color: "red",
              marginLeft: "2px",
            }}
          >
            *
          </span>
        </div>

        <div
          className="pvc-input-desc"
          style={{
            display: item.attribute.desc ? "block" : "none",
          }}
        >
          {item.attribute.desc}
        </div>

        <Input
          placeholder="请输入内容"
          value={item.attribute.value}
          //   disabled
          type="text"
        />

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
InputComponent.propTypes = {};

export default InputComponent;
