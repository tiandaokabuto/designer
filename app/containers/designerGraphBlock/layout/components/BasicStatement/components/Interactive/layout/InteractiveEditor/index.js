import React from 'react';
import GridLayout from 'react-grid-layout';

import InteractiveWrapper from '../../components/InteractiveWrapper';
import { useGetDomWidth } from '../../useHooks';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

export default () => {
  const [ref, width] = useGetDomWidth();
  const layout = [
    {
      i: 'placeholder-before',
      x: 0,
      y: 0,
      w: 3,
      h: 1,
      minW: 3,
      isDraggable: false,
    },
    { i: 'a', x: 0, y: 1, w: 1, h: 2 },
    { i: 'b', x: 1, y: 0, w: 3, h: 2 },
    { i: 'c', x: 2, y: 0, w: 1, h: 2 },
  ];

  return (
    <div className="interactive-container-layout" ref={ref}>
      <GridLayout
        className="layout"
        layout={layout}
        rowHeight={32}
        compactType="vertical"
        width={width}
        cols={3}
      >
        <div
          key="placeholder-before"
          style={{
            width: '100%',
            height: '100%',
            background: 'skyblue',
          }}
        >
          <InteractiveWrapper>占位符</InteractiveWrapper>
        </div>
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
