/* eslint-disable no-new */
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
  mxPerimeter,
  mxEvent,
  mxCellOverlay as MxCellOverlay,
} from 'mxgraph-js';
import { useInjectContext } from 'react-hook-easier/lib/useInjectContext';
// import { useSelector } from 'react-redux';

import MxGraphHeader from './components/MxGraphHeader';
import OutputPanel from '../../../designerGraphBlock/layout/DragContainer/OutputPanel';
import setConnection from './methods/setConnection';

import './index.scss';

const MxgraphContainer = useInjectContext(({ updateGraphData }) => {
  // const graphData = useSelector(state => state.grapheditor.graphData);
  // const graphDataMap = useSelector(state => state.grapheditor.graphDataMap);
  const graphContainer = useRef(null);
  const [graph, setGraph] = useState(null);

  useEffect(() => {
    const container = graphContainer.current;
    setGraph(new MxGraph(container));
  }, []);

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

    // 重写isValidDropTarget方法。加入自定义style.container的判断，只有容器组件可以被拖拽进去
    MxGraph.prototype.isValidDropTarget = function(cell, cells, evt) {
      const style = this.getCellStyle(cell);
      const isContainer = style.container === 1;

      return (
        cell != null &&
        ((this.isSplitEnabled() && this.isSplitTarget(cell, cells, evt)) ||
          (!this.model.isEdge(cell) &&
            (this.isSwimlane(cell) ||
              (this.model.getChildCount(cell) > 0 &&
                isContainer &&
                !this.isCellCollapsed(cell)))))
      );
    };
    // 重写isPort
    MxGraph.prototype.isPort = function(cell) {
      const geo = this.getCellGeometry(cell);

      return geo != null ? geo.relative : false;
    };
  };

  const configEventHandle = () => {
    graph.addListener(mxEvent.CLICK, function(sender, evt) {
      // const enc = new mxCodec();
      // console.log(enc.encode(graph.getModel()));

      const cell = evt.getProperty('cell');

      if (cell != null) {
        const overlays = graph.getCellOverlays(cell);
        // 排除连接点和连接线
        const isPort = graph.isPort(cell);

        if (overlays == null && !isPort) {
          // Creates a new overlay with an image and a tooltip
          const overlay = new MxCellOverlay(
            new MxImage('./containers/images/check.png', 16, 16),
            'Overlay tooltip'
          );

          // Installs a handler for clicks on the overlay
          /* overlay.addListener(mxEvent.CLICK, function(sender, evt2) {
            // mxUtils.alert('Overlay clicked');
          }); */

          // Sets the overlay for the cell in the graph
          graph.addCellOverlay(cell, overlay);
        } else {
          graph.removeCellOverlays(cell);
        }

        /*   if (!isPort) {
          const colorKey = 'fillColor';
          const color = '#9ed4fb';
          graph.setCellStyles(colorKey, color, graph.getSelectionCells());
        } */
      }
    });
  };

  const configLineStyleSheet = () => {
    let style = {};
    graph.getStylesheet().putCellStyle('port', style);
    style = graph.getStylesheet().getDefaultEdgeStyle();
    style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = '#777777';
    style[mxConstants.STYLE_STROKEWIDTH] = '1';
    style[mxConstants.STYLE_STROKECOLOR] = '#777777';
    style[mxConstants.STYLE_FILLCOLOR] = '#ffffff';
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

  const configProcessStyleSheet = () => {
    const style = {};
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
    style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_LEFT;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
    style[mxConstants.STYLE_FILLCOLOR] = '#edf6f7';
    style[mxConstants.STYLE_STROKECOLOR] = '#3d6dcc';
    style[mxConstants.STYLE_FONTCOLOR] = '#000000';
    style[mxConstants.STYLE_ROUNDED] = true;
    style[mxConstants.STYLE_FONTSIZE] = '12';
    style[mxConstants.STYLE_FONTSTYLE] = 0;
    style[mxConstants.STYLE_IMAGE_WIDTH] = '48';
    style[mxConstants.STYLE_IMAGE_HEIGHT] = '48';
    graph.getStylesheet().putDefaultVertexStyle(style);
  };

  const configContainerStyleSheet = () => {
    const style = {};
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_SWIMLANE;
    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
    style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP;
    style[mxConstants.STYLE_FILLCOLOR] = '#33a58a';
    style[mxConstants.STYLE_STROKECOLOR] = '#33a58a';
    style[mxConstants.STYLE_FONTCOLOR] = '#fff';
    style[mxConstants.STYLE_ROUNDED] = true;
    style[mxConstants.STYLE_STARTSIZE] = '30';
    style[mxConstants.STYLE_FONTSIZE] = '16';
    style[mxConstants.STYLE_FONTSTYLE] = 1;
    graph.getStylesheet().putCellStyle('group', style);
  };

  const configureStylesheet = () => {
    // 定义连线点的样式
    configLineStyleSheet();
    // 定义流程块的样式
    configProcessStyleSheet();
    // 定义容器块的样式
    configContainerStyleSheet();
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

  useEffect(() => {
    if (!graph) return;
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
    // 配置事件监听
    configEventHandle();
    // 配置连接约束点
    setConnection();
  }, [graph]);

  return (
    <div id="graphContent">
      <MxGraphHeader graph={graph} />
      <div className="dropContent">
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
