import React from 'react';
import { Flow } from 'gg-editor';

import FlowItemPanel from './components/FlowItemPanel';

export default () => {
  return (
    <div className="designergraph-container">
      <div className="designergraph-container-header">
        <FlowItemPanel />
        <span className="designergraph-container-header-title">
          我的项目我的项目我的项目我的项目我的项目
        </span>
      </div>
      <Flow
        className="designergraph-container-flow"
        onAfterChange={value => {
          // registerDataChange(value);
        }}
        noEndEdge={false}
        // data={{
        //   nodes: [
        //     {
        //       type: 'node',
        //       size: '100*100',
        //       shape: 'custom-node',
        //       color: '#FA8C16',
        //       label: 'Ant Design',
        //       labelOffsetY: 20,
        //       icon:
        //         '//img.alicdn.com/tfs/TB1gXH2ywHqK1RjSZFPXXcwapXa-200-200.svg',
        //       x: 100,
        //       y: 100,
        //       id: 'ea1184e8',
        //       index: 0,
        //     },
        //     {
        //       type: 'node',
        //       size: '100*100',
        //       shape: 'custom-node',
        //       color: '#FA8C16',
        //       label: 'React',
        //       labelOffsetY: 20,
        //       icon:
        //         '//img.alicdn.com/tfs/TB1OzAmyyLaK1RjSZFxXXamPFXa-200-200.svg',
        //       x: 100,
        //       y: 300,
        //       id: '481fbb1a',
        //       index: 2,
        //     },
        //   ],
        //   edges: [
        //     {
        //       source: 'ea1184e8',
        //       sourceAnchor: 1,
        //       target: '481fbb1a',
        //       targetAnchor: 0,
        //       id: '7989ac70',
        //       index: 1,
        //     },
        //   ],
        // }}
      />
    </div>
  );
};
