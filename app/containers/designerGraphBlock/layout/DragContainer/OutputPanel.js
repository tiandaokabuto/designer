import React, { useEffect } from 'react';
import useThrottle from 'react-hook-easier/lib/useThrottle';

let isMouseDown = false;
let startOffset = 0;

export default () => {
  useEffect(() => {
    const handleAnchorMouseMove = useThrottle(e => {
      if (isMouseDown) {
        let offset = startOffset - e.pageY;
        startOffset = e.pageY;
        if (e.clientY <= 114) return;
        const outputDom = document.querySelector(
          '.dragger-editor-container-output'
        );
        const originHeight = parseFloat(
          window.getComputedStyle(outputDom).height
        );
        if (originHeight <= 60 && offset < 0) return;
        outputDom.style.height = originHeight + offset + 'px';
      }
    }, 50);

    const handleMouseUp = () => {
      isMouseDown = false;
    };
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleAnchorMouseMove);
  }, []);
  return (
    <div className="dragger-editor-container-output">
      <div
        className="dragger-editor-container-output-anchor"
        onMouseDown={e => ((isMouseDown = true), (startOffset = e.pageY))}
      ></div>
      <div>输出</div>
    </div>
  );
};
