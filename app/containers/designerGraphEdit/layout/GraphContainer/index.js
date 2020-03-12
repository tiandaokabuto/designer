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
import HighlightEditor from '../../useHooks/HighlightEditor';

import EditorChange, {
  registerDataChange,
} from '../../useHooks/useEditorChange';

import { isEdgeConnectWithRhombusNode } from '../../RPAcore/utils';
import { findNodeByKey } from '../../../common/utils';

export default useInjectContext(
  withPropsAPI(
    ({
      propsAPI,
      history,
      showHead,
      updateGraphData,
      synchroCodeBlock,
      changeCheckedGraphBlockId,
      updateCurrentEditingProcessBlock,
    }) => {
      const { getSelected, executeCommand, update, save } = propsAPI;
      const graphData = useSelector(state => state.grapheditor.graphData);
      const graphDataMap = useSelector(state => state.grapheditor.graphDataMap);
      const currentCheckedTreeNode = useSelector(
        state => state.grapheditor.currentCheckedTreeNode
      );
      const processTree = useSelector(state => state.grapheditor.processTree);
      const [drawerVisible, setDrawerVisible] = useState(false);
      const node = findNodeByKey(processTree, currentCheckedTreeNode);
      // 自适应当前画布的大小
      useEffect(() => {
        showHead && propsAPI.executeCommand('autoZoom');
      }, []);
      return (
        <div className="designergraph-container">
          {!showHead && (
            <div className="designergraph-container-header">
              <FlowItemPanel />
              <span className="designergraph-container-header-title">
                {node && node.title}
              </span>
            </div>
          )}

          <Flow
            className="designergraph-container-flow"
            style={{
              background: showHead ? 'rgba(252, 252, 252, 1)' : '',
              height: showHead ? '100%' : '',
            }}
            onAfterChange={value => {
              // 将每次的状态更新保存下来
              registerDataChange(value);
            }}
            data={graphData}
            fitView={true}
            graph={{
              edgeDefaultShape: 'flow-polyline',
              ...(showHead
                ? {
                    mode: 'readOnly',
                    // modes: {
                    //   readOnly: [
                    //     'panCanvas',
                    //     'zoomCanvas',
                    //     // 'clickEdgeSelected',
                    //     // 'clickNodeSelected',
                    //     // 'clickCanvasSelected',
                    //   ],
                    // },
                    default: ['drag-canvas', 'zoom-canvas'],
                  }
                : {}),
            }}
            onNodeClick={node => {
              const dataId = node.shape._attrs.dataId;
              /**
               * 处理参数面板展示的逻辑
               */
              if (
                node.item &&
                ['processblock', 'rhombus-node'].includes(node.item.model.shape)
              ) {
                changeCheckedGraphBlockId(node.item.model.id);
              }

              /**
               * 跳转到代码块编辑页面
               * 跳转的时候就需要将即将编辑的流程块关联到当前的这个流程块的id
               * 同时需要同步当前的流程块的 保存在 graphDataMap 的数据结构, 否则置空
               * 同时需要更新头部导航栏菜单
               *
               * */
              switch (dataId) {
                case 'edit':
                  updateCurrentEditingProcessBlock(node.item.id);
                  synchroCodeBlock(graphDataMap.get(node.item.id));
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
              const model = edge.item.model;
              if (
                !showHead &&
                isEdgeConnectWithRhombusNode(edge.item.dataMap, model.source)
              ) {
                setDrawerVisible(true);
              }
              // 判断当前的edge是否与判断结点项关联\
            }}
            onDoubleClick={(...args) => {
              console.log(...args);
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
          {/* <HighlightEditor /> */}
        </div>
      );
    }
  )
);
