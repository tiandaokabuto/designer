import React, { useRef, useEffect } from 'react';
import {
  mxGraph as MxGraph,
  mxCell,
  mxImage,
  mxEdgeStyle,
  mxConstants,
} from 'mxgraph-js';

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

    // 启用连线功能
    graph.setConnectable(true);
    graph.connectionHandler.getConnectImage = function(state) {
      return new mxImage(state.style[mxConstants.STYLE_IMAGE], 16, 16);
    };

    configMxCell();
    configureStylesheet();
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

  const configureStylesheet = () => {
    let style = new Object();
    graph.getStylesheet().putCellStyle('port', style);
    style = graph.getStylesheet().getDefaultEdgeStyle();
    style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = '#777777';
    style[mxConstants.STYLE_STROKEWIDTH] = '1';
    style[mxConstants.STYLE_STROKECOLOR] = '#777777';
    style[mxConstants.STYLE_FILLCOLOR] = '#ffffff';
    // style[mxConstants.STYLE_EDGE] = mxEdgeStyle.TopToBottom;
    style[mxConstants.STYLE_EDGE] = mxEdgeStyle.ComponentEdge;
    style[mxConstants.STYLE_CURVED] = true;
    mxConstants.EDGE_SELECTION_DASHED = false;
    mxConstants.EDGE_SELECTION_STROKEWIDTH = 3;
    mxConstants.EDGE_SELECTION_COLOR = '#777777';
    mxConstants.VERTEX_SELECTION_STROKEWIDTH = 0;
    mxConstants.VERTEX_SELECTION_COLOR = 'none';
    mxConstants.HANDLE_FILLCOLOR = '#ffffff';
    mxConstants.HANDLE_STROKECOLOR = '#000000';
    mxConstants.GUIDE_COLOR = '#40a9ff';
    mxConstants.VALID_COLOR = '#40a9ff';
  };

  const setDataMingEdgeStyle = () => {
    mxEdgeStyle.ComponentEdge = function(
      state,
      source,
      target,
      points,
      result
    ) {
      var view = state.view;
      if (source != null && target != null) {
        if (source.y < target.y) {
          var t = Math.max(source.y, target.y);
          var b = Math.min(source.y + source.height, target.y + target.height);

          var x = view.getRoutingCenterX(source);
          var y = Math.round(b + (t - b) / 2);

          if (
            !mxUtils.contains(target, x, y) &&
            !mxUtils.contains(source, x, y)
          ) {
            result.push(new mxPoint(x, y));
          }

          x = view.getRoutingCenterX(target);

          if (
            !mxUtils.contains(target, x, y) &&
            !mxUtils.contains(source, x, y)
          ) {
            result.push(new mxPoint(x, y));
          }
        } else {
          result.push(
            new mxPoint(view.getRoutingCenterX(source), source.y + 50)
          );
          result.push(
            new mxPoint(view.getRoutingCenterX(target), target.y - 50)
          );
        }
      }
    };

    mxStyleRegistry.putValue('ComponentEdge', mxEdgeStyle.ComponentEdge);
  };

  const onDrop = e => {
    const componentToDropType = e.dataTransfer.getData('componentToDropType');
    if (componentToDropType) {
      let x = e.clientX;
      let y = e.clientY;
      const width = document.querySelector('.designergraph-item').clientWidth;
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
          left: x - width - 87,
          top: y - 112 - 19,
          componentType: 'process',
          nodeId: 1,
          name: '流程块',
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
