import React, { useEffect } from 'react';
// import FlowItemPanel from '../../../layout/GraphContainer/components/FlowItemPanel';

import './MxGraphHeader.scss';

const MxGraphHeader = () => {
  const onComponentDragStart = e => {
    e.dataTransfer.setData(
      'componentToDropType',
      e.target.getAttribute('data-component-type')
    );
  };

  return (
    <div className="designergraph-container-header">
      <div className="designergraph-container-header-tool">
        <div
          className="designergraph-container-header-tool-process"
          draggable
          data-component-type="process"
          onDragStart={onComponentDragStart}
        >
          流程块
        </div>
        <div
          className="designergraph-container-header-tool-rhombus"
          draggable
          data-component-type="rhombus"
          onDragStart={onComponentDragStart}
        >
          <div className="designergraph-container-header-tool-rhombus-left">
            <span></span>
          </div>
          <div className="designergraph-container-header-tool-rhombus-right">
            <span></span>
          </div>
          <span style={{ position: 'absolute', right: '18px' }}>判断</span>
        </div>
      </div>
      <span className="designergraph-container-header-title">
        {/* node && node.title */}
      </span>
    </div>
  );
};

export default MxGraphHeader;
