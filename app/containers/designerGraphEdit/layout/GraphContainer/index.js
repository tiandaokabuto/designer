import React, { useEffect, useState, useRef } from 'react';
import { Flow, withPropsAPI } from 'gg-editor';
import { useSelector } from 'react-redux';
import { Modal, Radio } from 'antd';
import { useInjectContext } from 'react-hook-easier/lib/useInjectContext';

import event, {
  CANVAS_ZOOM_OUT,
  CANVAS_ZOOM_IN,
} from '../../../designerGraphBlock/layout/eventCenter';
import FlowItemPanel from './components/FlowItemPanel';
import AreaNode from '../RegisterNode/AreaNode';
import ProcessBlockNode from '../RegisterNode/ProcessBlockNode';
import StartNode from '../RegisterNode/StartNode';
import EndNode from '../RegisterNode/EndNode';
import RhombusNode from '../RegisterNode/RhombusNode';
import ReuseCommand from './components/EditorContextMenu/ReuseCommand';
import CustomCommand from './components/EditorContextMenu/CustomCommand';
import RunToHereCommand from './components/EditorContextMenu/RunToHereCommand';
import RunFromHereCommand from './components/EditorContextMenu/RunFromHereCommand';

import WhileJPG from '@/containers/images/while.jpg';
import DoWhileJPG from '@/containers/images/doWhile.jpg';
import ForEachJPG from '@/containers/images/forEach.jpg';

import OutputPanel from '../../../designerGraphBlock/layout/DragContainer/OutputPanel';

import EditorChange, {
  registerDataChange,
} from '../../useHooks/useEditorChange';
import { synchroGraphDataToProcessTree } from '../../../reduxActions';

import { findNodeByKey, copyModule } from '../../../common/utils';

let isUnSelected = false;

export default useInjectContext(
  withPropsAPI(
    ({
      propsAPI,
      history,
      showHead,
      updateGraphData,
      synchroCodeBlock,
      changeCheckedGraphBlockId,
      updateCurrentPagePosition,
    }) => {
      const { getSelected, executeCommand, update, save, find } = propsAPI;
      const graphData = useSelector(state => state.grapheditor.graphData);
      const graphDataMap = useSelector(state => state.grapheditor.graphDataMap);
      const checkedGraphBlockId = useSelector(
        state => state.grapheditor.checkedGraphBlockId
      );
      const graphDataMapRef = useRef(new Map());
      graphDataMapRef.current = graphDataMap;
      const currentCheckedTreeNode = useSelector(
        state => state.grapheditor.currentCheckedTreeNode
      );

      // 当前所处的页面位置
      const currentPagePosition = useSelector(
        state => state.temporaryvariable.currentPagePosition
      );
      const processTree = useSelector(state => state.grapheditor.processTree);

      const node = findNodeByKey(processTree, currentCheckedTreeNode);
      // 自适应当前画布的大小
      useEffect(() => {
        showHead && propsAPI.executeCommand('autoZoom');
        const handleUndo = () => {
          executeCommand('undo');
          updateGraphData(save());
          synchroGraphDataToProcessTree();
        };
        const handleRedo = () => {
          executeCommand('redo');
          updateGraphData(save());
          synchroGraphDataToProcessTree();
        };
        const handleZoomOut = frequency => {
          for (let i = 0; i < frequency; i += 1) {
            executeCommand('zoomOut');
          }
        };
        const handleZoomIn = frequency => {
          for (let i = 0; i < frequency; i += 1) {
            executeCommand('zoomIn');
          }
        };
        event.addListener('undo', handleUndo);
        event.addListener('redo', handleRedo);
        event.addListener(CANVAS_ZOOM_OUT, handleZoomOut);
        event.addListener(CANVAS_ZOOM_IN, handleZoomIn);
        return () => {
          event.removeListener('undo', handleUndo);
          event.removeListener('redo', handleRedo);
          event.removeListener(CANVAS_ZOOM_OUT, handleZoomOut);
          event.removeListener(CANVAS_ZOOM_IN, handleZoomIn);
        };
      }, []);

      const [areaSizeModalVisible, setAreaSizeModalVisible] = useState(false);
      const [modalVisible, setModalVisible] = useState(false);
      const [loopType, setLoopType] = useState('while');

      const handlCopyClick = () => {
        console.log('触发复制');
        copyModule();
      };

      useEffect(() => {
        const arr = document.getElementsByClassName('command');
        if (arr.length > 0) {
          arr[0].addEventListener('click', handlCopyClick);
        }
        // for (let i = 0; i < arr.length; i++) {
        //   if (arr[i].innerText === '复制') {

        //   }
        // }
        return () => {
          if (arr.length > 0) {
            arr[0].removeEventListener('click', handlCopyClick);
          }
        };
      }, []);

      useEffect(() => {
        const handleModalChange = () => {
          setModalVisible(true);
        };
        const handleAreaSizeModalChange = () => {
          setAreaSizeModalVisible(true);
        };
        event.addListener('loopChoose', handleModalChange);
        event.addListener('setAreaSize', handleAreaSizeModalChange);
        return () => {
          event.removeListener('loopChoose', handleModalChange);
          event.removeListener('setAreaSize', handleAreaSizeModalChange);
        };
      }, []);

      useEffect(() => {
        const item = find(checkedGraphBlockId);
        if (!item) return;
        propsAPI.editor.getCurrentPage().setSelected(item, true);
      }, [checkedGraphBlockId]);

      return (
        <div
          className={
            showHead
              ? 'designergraph-container designergraph-container-readonly'
              : 'designergraph-container'
          }
        >
          {/* <div
            style={{
              background: 'red',
              width: '20px',
              height: '40px',
              position: 'absolute',
              top: '50%',
              margin: '-50px 0 0 0',
              right: 0,
            }}
          ></div>
          <div
            style={{
              background: 'red',
              width: '20px',
              height: '40px',
              position: 'absolute',
              top: '50%',
              margin: '-50px 0 0 0',
              left: 0,
            }}
          ></div> */}
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
              height: showHead ? '100%' : '',
            }}
            onAfterChange={value => {
              // 将每次的状态更新保存下来
              registerDataChange(value);
            }}
            data={graphData}
            fitView
            graph={{
              edgeDefaultShape: 'flow-polyline',
              ...(showHead
                ? {
                    mode: 'readOnly',
                    default: ['drag-canvas', 'zoom-canvas'],
                  }
                : {}),
            }}
            onNodeClick={node => {
              const dataId = node.shape._attrs.dataId;
              if (
                node.item &&
                ['processblock', 'rhombus-node'].includes(node.item.model.shape)
              )
                changeCheckedGraphBlockId(node.item.model.id);
            }}
            onContextMenu={node => {
              const arr = document.getElementsByClassName('command');
              for (let i = 0; i < arr.length; i++) {
                if (arr[i].innerText === '复制') {
                  arr[i].addEventListener('click', handlCopyClick);
                }
              }
            }}
            onDoubleClick={node => {
              if (
                node.item &&
                ['processblock'].includes(node.item.model.shape) &&
                !showHead
              ) {
                updateCurrentPagePosition('block');
                synchroCodeBlock(graphDataMapRef.current.get(node.item.id));
                Promise.resolve(true)
                  .then(() => {
                    history.push('/designGraph/block');
                    return true;
                  })
                  .catch(err => console.log(err));
              }
            }}
            onEdgeClick={() => {
              isUnSelected = false;
            }}
            onBeforeItemSelected={node => {
              // 选中状态下点击选中其他块，会先触发onNodeClick,再触发onAfterItemUnselected,最后触发onBeforeItemSelected
              // 这种状态暂时叫做重新选择，在此处记录重新选择的id
              if (
                node.item.type === 'node' &&
                (checkedGraphBlockId !== node.item.model.id || isUnSelected)
              ) {
                isUnSelected = false;
                // changeCheckedGraphBlockId(node.item.model.id);
              }
            }}
            onAfterItemUnselected={() => {
              isUnSelected = true;
            }}
            noEndEdge={false}
          />
          <AreaNode />
          <ProcessBlockNode />
          <StartNode />
          <EndNode />
          <RhombusNode />
          <EditorChange />
          <ReuseCommand />
          <CustomCommand />
          <RunFromHereCommand />
          <RunToHereCommand />
          {/* <HighlightEditor /> */}

          {!showHead && <OutputPanel tag="graph" />}

          <Modal
            visible={modalVisible}
            closable={false}
            width={'90vw'}
            bodyStyle={{
              height: '80vh',
              overflow: 'auto',
            }}
            centered
            onOk={() => {
              event.emit('loopChooseEnd', loopType);
              setModalVisible(false);
            }}
            onCancel={() => {
              setModalVisible(false);
            }}
          >
            <Radio.Group
              onChange={e => setLoopType(e.target.value)}
              value={loopType}
              style={{
                display: 'flex',
                position: 'relative',
              }}
            >
              <Radio value={'while'} className="while-radio">
                <div className="while-desc">While循环 (先判断再做的循环)</div>
                <img src={WhileJPG} style={{ width: '100%' }} />
              </Radio>
              <Radio value={'doWhile'} className="while-radio">
                <div className="while-desc">
                  Do-While循环 (先做再判断的循环)
                </div>
                <img src={DoWhileJPG} style={{ width: '100%' }} />
              </Radio>
              <Radio value={'forEach'} className="while-radio">
                <div className="while-desc">For循环 (数组遍历的循环)</div>
                <img
                  src={ForEachJPG}
                  style={{ width: '100%', height: '90%' }}
                />
              </Radio>
            </Radio.Group>
          </Modal>

          {/* <Modal
            visible={areaSizeModalVisible}
            closable={false}
            bodyStyle={{
              overflow: 'auto',
            }}
          ></Modal> */}
        </div>
      );
    }
  )
);
