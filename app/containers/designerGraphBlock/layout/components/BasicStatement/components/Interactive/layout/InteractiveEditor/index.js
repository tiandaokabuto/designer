import React from 'react';
import GridLayout from 'react-grid-layout';

import InteractiveWrapper from '../components/InteractiveWrapper';
import { useGetDomWidth } from '../../useHooks';

import BasicInputComponent from './components/BasicInputComponent';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

export default ({
  layout: { data, dataMap = {}, cols },
  handleLayoutChange,
}) => {
  const [ref, width] = useGetDomWidth();

  const generateComponent = desc => {
    switch (desc.type) {
      case 'input':
        return <BasicInputComponent desc={desc} />;
      default:
        return 'other';
    }
  };

  return (
    <div className="interactive-container-layout" ref={ref}>
      <GridLayout
        className="layout"
        draggableHandle=".interactive-handler"
        layout={data}
        onLayoutChange={handleLayoutChange}
        rowHeight={32}
        compactType="vertical"
        width={width}
        cols={3}
      >
        {(data || []).map(gridItem => (
          <div key={gridItem.i}>
            <InteractiveWrapper gridItem={gridItem}>
              {generateComponent(dataMap[gridItem.i])}
            </InteractiveWrapper>
          </div>
        ))}
      </GridLayout>
    </div>
  );
};
