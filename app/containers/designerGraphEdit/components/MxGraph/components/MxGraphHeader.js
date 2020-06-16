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
      </div>
      <span className="designergraph-container-header-title">
        {/* node && node.title */}
      </span>
    </div>
  );
};

export default MxGraphHeader;
