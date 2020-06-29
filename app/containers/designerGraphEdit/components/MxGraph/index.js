import React, { useRef, useEffect, useState } from 'react';
import {
  mxGraph as MxGraph,
  mxCell,
  mxImage as MxImage,
  mxEdgeStyle,
  mxConstants,
  mxEdgeHandler,
  mxPoint as MxPonint,
  mxStyleRegistry,
  mxUtils,
  mxGraphHandler,
  mxRubberband as MxRubberband,
} from 'mxgraph-js';
import { useInjectContext } from 'react-hook-easier/lib/useInjectContext';
import { useSelector } from 'react-redux';
import uniqueId from 'lodash/uniqueId';

import MxGraphHeader from './components/MxGraphHeader';
import component from './Component';
import RComponent from './RComponent';
import groundComponent from './GroupComponent';
import event from '../../../designerGraphBlock/layout/eventCenter';
import OutputPanel from '../../../designerGraphBlock/layout/DragContainer/OutputPanel';

import './index.scss';

const MxgraphContainer = useInjectContext(({ updateGraphData }) => {
  const graphData = useSelector(state => state.grapheditor.graphData);
  const graphDataMap = useSelector(state => state.grapheditor.graphDataMap);
  console.log(graphData, graphDataMap);
  const graphContainer = useRef(null);
  const [graph, setGraph] = useState(null);

  useEffect(() => {
    const container = graphContainer.current;
    setGraph(new MxGraph(container));
  }, []);

  useEffect(() => {
    if (graph) {
      // 启用插入html label
      graph.htmlLabels = true;

      // 取消设置连线选中时出现那个调整点
      mxEdgeHandler.prototype.handleImage = new MxImage('', 0, 0);

      // 启用连线功能
      graph.setConnectable(true);
      graph.connectionHandler.getConnectImage = function(state) {
        return new MxImage(state.style[mxConstants.STYLE_IMAGE], 16, 16);
      };

      // 连线不允许悬空
      graph.setAllowDanglingEdges(false);
      // 允许子项内容超出父项
      graph.constrainChildren = false;
      // 允许子项改变宽度后，内容超出父项
      graph.extendParents = false;
      // 允许拖拽到另一个单元格中
      graph.setDropEnabled(true);

      // 允许框线选择
      // eslint-disable-next-line no-new
      new MxRubberband(graph);

      // 启用辅助线
      mxGraphHandler.prototype.guidesEnabled = true;
      window.mxGraphHandler = mxGraphHandler;

      // 设置连线样式
      setDataMingEdgeStyle();
      // 设置
      configureStylesheet();
      // 配置mxCell方法
      configMxCell();
    }
  }, [graph]);

  useEffect(() => {
    // 监听添加事件
    event.addListener('createFunctionCell', createFunctionCell);
    return () => {
      event.removeListener('createFunctionCell', createFunctionCell);
    };
  }, [graph]);

  const createFunctionCell = (commonData, data) => {
    switch (commonData.componentType) {
      case 'process':
        // 改造成function
        component(graph, commonData, data);
        break;
      case 'rhombus':
        new RComponent(graph, commonData, data);
        break;
      case 'group':
        groundComponent(graph, commonData, data);
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
    // 更新组件状态
    mxCell.prototype.updateStatus = function(graph, status) {
      let html = this.getValue();
      const index = html.indexOf('class="status');
      if (index === -1) {
        return;
      }

      html = html.substring(0, index);
      switch (status) {
        case 0:
          html += 'class="status status-init"></span></div>';
          break;
        case 1:
          html += 'class="status status-noparam"></span></div>';
          break;
        case 2:
          html += 'class="status status-running"></span></div>';
          break;
        case 4:
          html += 'class="status status-fail"></span></div>';
          break;
        case 3:
          html += 'class="status status-success"></span></div>';
          break;
        default:
          html += 'class="status"></span></div>';
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
    let style = {};
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

  /**
   * 设置连线样式
   */
  const setDataMingEdgeStyle = () => {
    mxEdgeStyle.ComponentEdge = (state, source, target, points, result) => {
      const { view } = state;
      if (source != null && target != null) {
        if (source.y < target.y) {
          const t = Math.max(source.y, target.y);
          const b = Math.min(
            source.y + source.height,
            target.y + target.height
          );

          let x = view.getRoutingCenterX(source);
          const y = Math.round(b + (t - b) / 2);

          if (
            !mxUtils.contains(target, x, y) &&
            !mxUtils.contains(source, x, y)
          ) {
            result.push(new MxPonint(x, y));
          }

          x = view.getRoutingCenterX(target);

          if (
            !mxUtils.contains(target, x, y) &&
            !mxUtils.contains(source, x, y)
          ) {
            result.push(new MxPonint(x, y));
          }
        } else {
          result.push(
            new MxPonint(view.getRoutingCenterX(source), source.y + 50)
          );
          result.push(
            new MxPonint(view.getRoutingCenterX(target), target.y - 50)
          );
        }
      }
    };

    mxStyleRegistry.putValue('ComponentEdge', mxEdgeStyle.ComponentEdge);
  };

  /**
   * 拖拽放手后的处理函数
   * @param {*} e event对象
   */
  const onDrop = e => {
    const componentToDropType = e.dataTransfer.getData('componentToDropType');
    const rComponentToDropType = e.dataTransfer.getData('rComponentToDropType');
    const groupComponentToDropType = e.dataTransfer.getData(
      'groupComponentToDropType'
    );

    const x = e.clientX;
    const y = e.clientY;
    const width = document.querySelector('.designergraph-item').clientWidth;
    if (componentToDropType) {
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
          nodeId: uniqueId('mxGraph'),
          name: '流程块',
          node_status: 0,
        },
        {}
      );
    } else if (rComponentToDropType) {
      event.emit(
        'createFunctionCell',
        {
          left: x - width - 87,
          top: y - 112 - 19,
          componentType: 'rhombus',
          nodeId: uniqueId('mxGraph'),
          name: '判断',
          node_status: 0,
        },
        {}
      );
    } else if (groupComponentToDropType) {
      event.emit(
        'createFunctionCell',
        {
          left: x - width - 87,
          top: y - 112 - 19,
          componentType: 'group',
          nodeId: uniqueId('mxGraph'),
          name: '容器',
          node_status: 0,
        },
        {}
      );
    }
  };

  /**
   * 可拖拽区域
   * @param {*} e event对象
   */
  const allowDrop = e => {
    e.preventDefault();
  };

  return (
    <div id="graphContent">
      <MxGraphHeader graph={graph} />
      <div onDrop={onDrop} className="dropContent" onDragOver={allowDrop}>
        <div
          className="graph-container"
          ref={graphContainer}
          id="graphContainer"
        />
      </div>
      <OutputPanel tag="graph" />
    </div>
  );
});

export default MxgraphContainer;
