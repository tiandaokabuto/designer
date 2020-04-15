import React, { useState } from 'react';
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

const Zoom = () => {
  const [zoomLevel, setZoomLevel] = useState(9);
  const graphData = useSelector(state => state.grapheditor.graphData);
  const isCanvasNoNode = !graphData.nodes || graphData.nodes.length === 0;

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

  const handleClick = (type, frequency) => {
    if (zoomLevel >= 19 || zoomLevel <= 1 || isCanvasNoNode) return;
    if (type === 'zoom-in') {
      event.emit(CANVAS_ZOOM_IN, frequency);
      setZoomLevel(zoomLevel + frequency);
    } else if (type === 'zoom-out') {
      event.emit(CANVAS_ZOOM_OUT, frequency);
      setZoomLevel(zoomLevel - frequency);
    }
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
