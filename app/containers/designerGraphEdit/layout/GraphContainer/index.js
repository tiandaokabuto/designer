import React from 'react';
import { Flow, withPropsAPI } from 'gg-editor';

import FlowItemPanel from './components/FlowItemPanel';

export default withPropsAPI(({ propsAPI }) => {
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
        onNodeClick={_ => {
          const { getSelected, executeCommand, update, save } = propsAPI;

          const item = getSelected()[0];
          console.log(item, save()); // 很重要
          executeCommand(() => {
            update(item, {
              label: 'hhh',
              style: {
                fill: 'red',
              },
            });
          });
        }}
        noEndEdge={false}
      />
    </div>
  );
});
