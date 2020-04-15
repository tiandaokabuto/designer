import React, { useEffect, useState } from 'react';

let isMouseDown = false;
let pageX = 0;
let pageY = 0;

export default ({ visible }) => {
  useEffect(() => {
    const toolBar = document.querySelector(
      'div.dragger-editor-container-output-toolbar'
    );
    const handleMouseUp = () => {
      isMouseDown = false;
    };
    const handleMouseMove = e => {
      if (isMouseDown) {
        let offsetTop = e.pageY - pageY;
        let offsetLeft = e.pageX - pageX;
        pageX = e.pageX;
        pageY = e.pageY;
        const newTop = parseInt(toolBar.style.top, 10) + offsetTop;
        const newLeft = parseInt(toolBar.style.left, 10) + offsetLeft;
        toolBar.style.top = (newTop < 0 ? 0 : newTop) + 'px';
        toolBar.style.left = (newLeft < 0 ? 0 : newLeft) + 'px';
        if (newTop < -20 || newLeft < -20) {
          isMouseDown = false;
        }
      }
    };
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);
  }, []);
  return (
    <div
      className="dragger-editor-container-output-toolbar"
      onMouseDown={e => {
        isMouseDown = true;
        pageX = e.pageX;
        pageY = e.pageY;
        e.stopPropagation();
      }}
      style={{
        top: 0,
        left: 0,
        zIndex: visible ? 2 : -1,
      }}
    >
      搜索结果: class, 共<span style={{ color: 'red' }}>32</span>个结果
    </div>
  );
};
