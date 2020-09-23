import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Select, Button } from 'antd';

import event, { CANVAS_ZOOM_OUT, CANVAS_ZOOM_IN } from '../../../eventCenter';
import './index.scss';

const { Option } = Select;

const zoomStep = 10;
const zoomCount = 19;
const zoomOptions = [];
for (let i = 0; i < zoomCount; i += 1) {
  zoomOptions.push([`${zoomStep * (i + 1)}%`]);
}

const Zoom = ({ zoomIn, zoomOut, zoomLevel, setZoomLevel }) => {
  // const [zoomLevel, setZoomLevel] = useState(
  //   localStorage.getItem('zoom') ? localStorage.getItem('zoom') : 9
  // );
  // const graphData = useSelector(state => state.grapheditor.graphData) || {
  //   nodes: [],
  // };
  const isCanvasNoNode = /* !graphData.nodes || graphData.nodes.length === 0 */ false;

  /**
   *
   * @param {*} type 标识放大还是缩小
   * @param {*} frequency 距离当前比例的步数
   */
  const handleClick = (type, frequency) => {
    const zoom = parseInt(zoomLevel);
    if (isCanvasNoNode) return;
    if (type === 'zoom-in') {
      if (zoom >= 19) return;
      // event.emit(CANVAS_ZOOM_IN, frequency);
      if (zoomIn) {
        zoomIn(frequency); // 设置缩放
        localStorage.setItem('zoom', zoom + frequency);
      }
      setZoomLevel(zoom + frequency);
    } else if (type === 'zoom-out') {
      if (zoom <= 1) return;
      // event.emit(CANVAS_ZOOM_OUT, frequency);
      if (zoomOut) {
        zoomOut(frequency);
        localStorage.setItem('zoom', zoom - frequency);
      }
      setZoomLevel(zoom - frequency);
    }
  };

  const handleChange = value => {
    if (isCanvasNoNode) return;
    const currentZoomLevel = Number(value.replace('%', '')) / zoomStep;
    if (currentZoomLevel < zoomLevel) {
      const numberDiff = zoomLevel - currentZoomLevel;
      handleClick('zoom-out', numberDiff);
    } else if (currentZoomLevel > zoomLevel) {
      const numberDiff = currentZoomLevel - zoomLevel;
      handleClick('zoom-in', numberDiff);
    }
    setZoomLevel(currentZoomLevel);
  };

  return (
    <div className="zoom-toolbar">
      <Button icon="zoom-in" onClick={() => handleClick('zoom-in', 1)} />
      <Select
        value={`${zoomLevel * zoomStep}%`}
        style={{ width: 69 }}
        onChange={handleChange}
        showArrow={false}
      >
        {zoomOptions.map(item => (
          <Option key={item}>{item}</Option>
        ))}
      </Select>
      <Button icon="zoom-out" onClick={() => handleClick('zoom-out', 1)} />
    </div>
  );
};

export default Zoom;
