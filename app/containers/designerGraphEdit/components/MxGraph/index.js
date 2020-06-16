import React, { useRef, useEffect } from 'react';
import { mxGraph as MxGraph, mxCell } from 'mxgraph-js';

import MxGraphHeader from './components/MxGraphHeader';
import DefaultComponent from './Component';
import event from '../../../designerGraphBlock/layout/eventCenter';

import './index.scss';

const MxgraphContainer = () => {
  const graphContainer = useRef(null);
  let graph = null;

  useEffect(() => {
    const container = graphContainer.current;
    graph = new MxGraph(container);
    // 启用插入html label
    graph.htmlLabels = true;
    configMxCell();
  }, []);

  useEffect(() => {
    // 监听添加事件
    event.addListener('createFunctionCell', createFunctionCell);
    return () => {
      event.removeListener('createFunctionCell', createFunctionCell);
    };
  }, []);

  const createFunctionCell = (commonData, data) => {
    switch (commonData.componentType) {
      case 'process':
        // 改造成function
        new DefaultComponent(graph, commonData, data);
        break;
      default:
        break;
    }
  };

  const configMxCell = () => {
    mxCell.prototype.setNodeType = function(nodetype) {
      this.nodetype = nodetype;
    };
    mxCell.prototype.setComponentType = function(componentType) {
      this.componentType = componentType;
    };
    mxCell.prototype.setNodeId = function(nodeId) {
      this.nodeId = nodeId;
    };
    //更新组件状态
    mxCell.prototype.updateStatus = function(graph, status) {
      let html = this.getValue();
      let id = this.nodeId;
      let index = html.indexOf('class="status');
      if (index == -1) {
        return;
      }

      html = html.substring(0, index);
      switch (status) {
        case 0:
          html = html + 'class="status status-init"></span></div>';
          break;
        case 1:
          html = html + 'class="status status-noparam"></span></div>';
          break;
        case 2:
          html = html + 'class="status status-running"></span></div>';
          break;
        case 4:
          html = html + 'class="status status-fail"></span></div>';
          break;
        case 3:
          html = html + 'class="status status-success"></span></div>';
          break;
        default:
          html = html + 'class="status"></span></div>';
          console.log('状态改变异常');
      }
      this.setValue(html);
      graph.cellLabelChanged(this, html);
    };
    mxCell.prototype.setPortIndex = function(portIndex) {
      this.portIndex = portIndex;
    };
    mxCell.prototype.setPortType = function(portType) {
      this.portType = portType;
    };
  };

  const onDrop = e => {
    const componentToDropType = e.dataTransfer.getData('componentToDropType');
    if (componentToDropType) {
      let x = e.clientX;
      let y = e.clientY;
      console.log(x, y);
      /* let left = x - 450 + offsetLeft;
      let top = y - 70 + offsetTop;

      if (left < 0 || top < 0) {
        message.info('拖动超出操作区域');
        this.loadExp(this.state.currentExp.id);
        return;
      } */
      // 触发添加事件
      event.emit(
        'createFunctionCell',
        {
          left: x,
          top: y,
          componentType: 'process',
          nodeId: 1,
          name: '流程',
          node_status: 0,
        },
        {}
      );
    }
  };

  const allowDrop = e => {
    e.preventDefault();
  };

  return (
    <div id="graphContent">
      <MxGraphHeader />
      <div onDrop={onDrop} className="dropContent" onDragOver={allowDrop}>
        <div
          className="graph-container"
          ref={graphContainer}
          id="graphContainer"
        />
      </div>
    </div>
  );
};

export default MxgraphContainer;
