import React, { useEffect } from 'react';
import { Flow, withPropsAPI } from 'gg-editor';
import { useSelector } from 'react-redux';
import { useInjectContext } from 'react-hook-easier/lib/useInjectContext';

import FlowItemPanel from './components/FlowItemPanel';
import ProcessBlockNode from '../RegisterNode/ProcessBlockNode';
import StartNode from '../RegisterNode/StartNode';
import EndNode from '../RegisterNode/EndNode';
import RhombusNode from '../RegisterNode/RhombusNode';

import EditorChange, {
  registerDataChange,
} from '../../useHooks/useEditorChange';

export default useInjectContext(
  withPropsAPI(({ propsAPI, history, updateGraphData }) => {
    const { getSelected, executeCommand, update, save } = propsAPI;
    const graphData = useSelector(state => state.grapheditor.graphData);
    console.log(graphData);

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
            // 将每次的状态更新保存下来
            registerDataChange(value);
          }}
          data={graphData}
          graph={{ edgeDefaultShape: 'flow-polyline' }}
          onNodeClick={node => {
            const dataId = node.shape._attrs.dataId;

            /** 跳转到代码块编辑页面 */
            switch (dataId) {
              case 'edit':
                updateGraphData(save());
                setTimeout(() => {
                  history.push('/designerGraphBlock');
                }, 0);
                return false;
                break;
              default:
              // do nothing
            }

            //const item = getSelected()[0];
            //console.log(item, save()); // 很重要
            // executeCommand(() => {
            //   update(item, {
            //     label: 'hhh',
            //     style: {
            //       fill: 'red',
            //     },
            //   });
            // });
          }}
          noEndEdge={false}
        />
        <ProcessBlockNode />
        <StartNode />
        <EndNode />
        <RhombusNode />
        <EditorChange />
      </div>
    );
  })
);
