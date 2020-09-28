import React, { useState, useEffect } from "react";
import { Radio, Divider } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import "../public.less";

const ImageComponent = (props) => {
  let { item, handleSelect, focusItemId, handleDeleteComponent } = props;

  return (
    <div
      className={`component-contain ${
        focusItemId === item.id ? "item-selected" : ""
      }`}
      style={{
        width: item.width,
      }}
      onClick={handleSelect}
    >
      <div className="component-title">图片选择</div>
      {item.item
        ? item.item.map((item) => {
            return (
              <div
                onClick={handleSelect}
                style={{ display: "inline-block", width: "30%", margin: "1%" }}
              >
                <img
                  style={{ width: "100%", display: "block" }}
                  //   src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
                  src="https://ss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=3331618177,4136385783&fm=26&gp=0.jpg"
                  alt=""
                />
                <Radio>{item.name}</Radio>
              </div>
            );
          })
        : ""}
      <div
        className="delete-component-btn"
        style={{
          display: focusItemId === item.id ? "block" : "none",
        }}
        onClick={handleDeleteComponent}
      >
        <DeleteOutlined />
      </div>
    </div>
  );
};
ImageComponent.propTypes = {};

export default ImageComponent;
