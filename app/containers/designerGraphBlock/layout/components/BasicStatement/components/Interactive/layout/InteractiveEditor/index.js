import React from 'react';
import GridLayout from 'react-grid-layout';

import InteractiveWrapper from '../../components/InteractiveWrapper';
import { useGetDomWidth } from '../../useHooks';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

export default ({ layout }) => {
  const [ref, width] = useGetDomWidth();

  const handleLayoutChange = layout => {
    console.log(layout);
  };

  return (
    <div className="interactive-container-layout" ref={ref}>
      <GridLayout
        className="layout"
        layout={layout}
        onLayoutChange={handleLayoutChange}
        rowHeight={32}
        compactType="vertical"
        width={width}
        cols={3}
      >
        <div key="a">a</div>
        <div
          key="b"
          style={{
            width: '100%',
            height: '100%',
            background: 'gray',
          }}
        >
          b
        </div>
        <div key="c">c</div>
      </GridLayout>
    </div>
  );
};
