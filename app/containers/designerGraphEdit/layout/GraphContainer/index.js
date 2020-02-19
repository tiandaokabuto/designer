import React, { useEffect, useState } from 'react';
import { Flow, withPropsAPI } from 'gg-editor';
import { useSelector } from 'react-redux';
import { useInjectContext } from 'react-hook-easier/lib/useInjectContext';

import FlowItemPanel from './components/FlowItemPanel';
import ProcessBlockNode from '../RegisterNode/ProcessBlockNode';
import StartNode from '../RegisterNode/StartNode';
import EndNode from '../RegisterNode/EndNode';
import RhombusNode from '../RegisterNode/RhombusNode';

import EditorDrawer from './components/EditorDrawer';

import EditorChange, {
  registerDataChange,
} from '../../useHooks/useEditorChange';

export default useInjectContext(
  withPropsAPI(({ propsAPI, history, updateGraphData }) => {
    const { getSelected, executeCommand, update, save } = propsAPI;
    const graphData = useSelector(state => state.grapheditor.graphData);
    console.log(graphData);
    const [drawerVisible, setDrawerVisible] = useState(false);
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
            console.log(node);
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
          onEdgeClick={edge => {
            /** 点击边的时候判断是否触发label的添加 */
            console.log(edge);
            setDrawerVisible(true);
          }}
          noEndEdge={false}
        />
        <EditorDrawer
          visible={drawerVisible}
          setDrawerVisible={setDrawerVisible}
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
