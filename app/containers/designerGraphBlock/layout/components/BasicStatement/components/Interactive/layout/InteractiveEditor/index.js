import React from 'react';
import GridLayout from 'react-grid-layout';

import InteractiveWrapper from '../../components/InteractiveWrapper';
import { useGetDomWidth } from '../../useHooks';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

export default ({
  layout: { data, dataMap = {}, cols },
  handleLayoutChange,
}) => {
  const [ref, width] = useGetDomWidth();

  return (
    <div className="interactive-container-layout" ref={ref}>
      <GridLayout
        className="layout"
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
              {dataMap[gridItem.i].name}
            </InteractiveWrapper>
          </div>
        ))}

        {/* <div
          key="b"
          style={{
            width: '100%',
            height: '100%',
            background: 'gray',
          }}
        >
          b
        </div>
        <div key="c">c</div> */}
      </GridLayout>
    </div>
  );
};
