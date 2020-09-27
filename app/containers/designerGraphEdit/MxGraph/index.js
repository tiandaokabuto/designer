/* eslint-disable no-new */
import React, { useRef, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useInjectContext } from 'react-hook-easier/lib/useInjectContext';
import useDebounce from 'react-hook-easier/lib/useDebounce';
import X2JS from 'x2js';
import { Icon } from 'antd';
// import { useSelector } from 'react-redux';

import mxgraph from './mxgraph';
import GraphItem from '../GraphItem';
import GraphParamPanel from '../GraphParamPanel';
import MxGraphHeader from './components/MxGraphHeader';
import OutputPanel from '@/containers/components/OutputPanel/OutputPanel';
import { isDirNode, changeModifyState } from '_utils/utils';
// import useSaveAsXML from '../../../common/DragEditorHeader/useHooks/useSaveAsXML';
import {
  changeMxGraphData,
  setGraphDataMap,
  updateGraphData,
  synchroGraphDataToProcessTree,
  changeCheckedGraphBlockId,
  synchroCodeBlock,
  changeSavingModuleData,
  deleteGraphDataMap,
  changeUndoAndRedo,
  updateCurrentPagePosition,
  changeBlockTreeTab,
} from '../../reduxActions';
import { setConnection, createPopupMenu } from './methods';
import useMxId from './methods/useMxId';
import {
  PROCESS_NODE,
  CONDITION_NODE,
  START_NODE,
  END_NODE,
  GROUP_NODE,
  TRY_NODE,
  BREAK_NODE,
  CONTINUE_NODE,
} from './CellProperties';
import { POINT_POSITION_EXIT, POINT_POSITION_ENTRY } from './PointPosition';
import event from '@/containers/eventCenter';
import { updateGraphDataAction, deleteCellAction } from './mxgraphAction';

import './index.scss';

// liuqi
import { Action_DeleteCell, getTempCellParent } from './actions/deleteCell';
import { Action_CopyCell, Action_PasteCell } from './actions/copyCell';
import { Action_findNode } from './actions/findNode';
import { translateToGraphData } from './actions/translateToGraphData';

import { Rule_checkConnection } from './rules/checkRules';
import {
  Rule_sizeRule,
  Rule_move_sizeRule,
  getSibilings,
  getMiddleWidth,
  getMiddleHeight,
  getLastHeight,
} from './rules/sizeRule';

import {
  goHandleUndo,
  goHandleRedo,
  find_id,
  deleteFromMxModel,
} from './actions/undoAndRedo.js';
import { message } from 'antd';
import { cloneDeep } from 'lodash';
import { call } from 'file-loader';

const fs = require('fs');
const checkPng = require('./images/check.png');
let graph = null;
let undoMng = null;

const x2js = new X2JS();

const MxgraphContainer = useInjectContext(
  ({ updateGraphData, history, setShowLoadingLayer }) => {
    // 流程图的信息
    const graphData = useSelector(state => state.grapheditor.graphData);

    // 每个流程快包含的信息
    const graphDataMap = useSelector(state => state.grapheditor.graphDataMap);
    const graphDataRef = useRef({});
    graphDataRef.current = graphData;

    const graphDataMapRef = useRef(new Map());
    graphDataMapRef.current = graphDataMap;

    // 选中的块
    const checkedGraphBlockId = useSelector(
      state => state.grapheditor.checkedGraphBlockId
    );

    // 左侧选中的节点
    const currentCheckedTreeNode = useSelector(
      state => state.grapheditor.currentCheckedTreeNode
    );
    const currentCheckedTreeNodeRef = useRef(null);
    currentCheckedTreeNodeRef.current = currentCheckedTreeNode;

    const currentPagePosition = useSelector(
      state => state.temporaryvariable.currentPagePosition
    );
    const currentPagePositionRef = useRef(null);
    currentPagePositionRef.current = currentPagePosition;

    // undoAndRedo 第一层撤销重做
    const undoAndRedo = useSelector(state => state.grapheditor.undoAndRedo);
    const undoAndRedoRef = useRef(null);
    undoAndRedoRef.current = undoAndRedo;

    // 流程树
    const processTree = useSelector(state => state.grapheditor.processTree);
    const processTreeRef = useRef(null);
    processTreeRef.current = processTree;

    const isProcessNode =
      currentCheckedTreeNode &&
      !!!isDirNode(processTree, currentCheckedTreeNode);

    const graphContainer = useRef(null);

    const layoutManagerRef = useRef(null);

    const [resetTag, setResetTag] = useState(false);

    const graphRef = useRef(null);

    const getMxId = useMxId();

    const [conLeft, setConLeft] = useState(1);

    const [conRight, setConRight] = useState(1);

    const [zoomLevel, setZoomLevel] = useState(9);

    // const [zoomLevel, setZoomLevel] = useState(
    //   localStorage.getItem('zoom') ? localStorage.getItem('zoom') : 9
    // );

    // const saveAsXML = useSaveAsXML();

    const {
      mxGraph,
      mxCell,
      mxImage: MxImage,
      mxEdgeStyle,
      mxConstants,
      mxEdgeHandler,
      mxPoint: MxPonint,
      mxStyleRegistry,
      mxUtils,
      mxGraphHandler,
      mxRubberband: MxRubberband,
      mxPerimeter,
      mxEvent,
      mxCellOverlay: MxCellOverlay,
      mxCodec: MxCodec,
      mxVertexHandler,
      mxSelectionCellsHandler,
      mxEventObject,
      mxDragSource,
      mxGeometry: MxGeometry,
      mxRectangle: MxRectangle,
      mxLayoutManager,
      mxGraphLayout,
      mxSwimlaneLayout,
      mxCellTracker,
      // 剪切板
      mxClipboard,
      // 撤销重做
      mxUndoManager,
    } = mxgraph;

    const handlePanMove = useDebounce((sender, evt) => {
      changeModifyState(
        processTreeRef.current,
        currentCheckedTreeNodeRef.current,
        true
      );
      updateGraphDataAction(sender);
    }, 200);

    const handleUndo = () => {
      goHandleUndo(graph, undoAndRedoRef.current, updateGraphDataAction);
    };

    const handleRedo = () => {
      goHandleRedo(graph, undoAndRedoRef.current, updateGraphDataAction);
    };

    // 复制流程块
    const handleCopyProcess = () => {
      console.log('触发复制');
      Action_CopyCell(graph, { mxClipboard, changeSavingModuleData });
    };
    // 粘贴流程块
    const handlePasteProcess = () => {
      Action_PasteCell(graph, {
        mxClipboard,
        setGraphDataMap,
        changeCheckedGraphBlockId,
        graphData: graphDataRef.current,
        undoAndRedoRef,
      });
    };
    // 删除流程块
    const handleDeleteProcess = () => {
      Action_DeleteCell(graph, {
        deleteGraphDataMap,
        changeCheckedGraphBlockId,
        graphData: graphDataRef.current,
      });
    };

    useEffect(() => {
      const container = graphContainer.current;
      // setGraph(new mxGraph(container));
      graphRef.current = new mxGraph(container);
      graph = graphRef.current;

      layoutManagerRef.current = new mxLayoutManager(graph);

      undoMng = new mxUndoManager();
      event.addListener('undo', handleUndo);
      event.addListener('redo', handleRedo);
      event.addListener('resetGraph', resetGraph);
      event.addListener('copyProcess', handleCopyProcess);
      event.addListener('pasteProcess', handlePasteProcess);
      event.addListener('deleteProcess', handleDeleteProcess);

      // 地表最强监听   实属牛逼
      // Object.keys(mxEvent).forEach(item => {
      //   if (!item[0].match(/^.*[A-Z]+.*$/)) {
      //     return;
      //   }

      //   console.log(item);
      //   //console.log(_this)

      //   if (item === 'MOUSE_MOVE') return;
      //   if (item === 'FIRE_MOUSE_EVENT') return;

      //   graph.addListener(mxEvent[item], function (sender, evt) {
      //     console.log(`当前执行了`, item, { sender, evt, mxEvent });
      //   });
      //   console.clear();
      // });

      return () => {
        event.removeListener('undo', handleUndo);
        event.removeListener('redo', handleRedo);
        event.removeListener('resetGraph', resetGraph);
        event.removeListener('copyProcess', handleCopyProcess);
        event.removeListener('pasteProcess', handlePasteProcess);
        event.removeListener('deleteProcess', handleDeleteProcess);
      };
    }, []);

    useEffect(() => {
      // if (!graph) return;
      graph.htmlLabels = true;

      // 判断逻辑
      graph.setMultigraph(false); //

      // mxGraph.prototype.isConnectable = () => {

      // };

      // 取消设置连线选中时出现那个调整点
      mxEdgeHandler.prototype.handleImage = new MxImage('', 0, 0);

      // 启用连线功能
      graph.setConnectable(true);
      graph.connectionHandler.getConnectImage = function (state) {
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
      //  启用画布平移
      graph.setPanning(true);
      // 开启右键菜单
      graph.popupMenuHandler.factoryMethod = function (menu, cell, evt) {
        return createPopupMenu(
          graph,
          menu,
          cell,
          evt,
          mxClipboard,
          changeSavingModuleData,
          graphDataMapRef,
          setGraphDataMap,

          deleteGraphDataMap,
          changeCheckedGraphBlockId,
          graphDataRef.current,
          undoAndRedoRef
        );
      };

      // 允许框线选择
      new MxRubberband(graph);

      new mxCellTracker(graph, '#fff');

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

      // 添加数据
      // const div = document.createElement('div');
      // div.innerText =
      //   '<mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/><mxCell id="2" value="&lt;div class=&quot;compoent-content&quot;&gt;&lt;label class=&quot;component-icon&quot;&gt;&lt;/label&gt;&lt;span class=&quot;component-name&quot; title=&quot;process&quot;&gt;流程块&lt;/span&gt;&lt;/div&gt;" style="label;whiteSpace=wrap;html=1;;resizable=0;image=../../../../images/icon.jpg" vertex="1" parent="1"><mxGeometry x="295" y="167" width="186" height="55" as="geometry"/><Array as="properties"><Object cnName="标签名称" enName="label" value="流程块" default=""/><Object cnName="输入参数" enName="param" default=""><Array as="value"/></Object><Object cnName="流程块返回" enName="output" default=""><Array as="value"/></Object></Array><Array as="variable"/></mxCell><mxCell id="3" value="&lt;div class=&quot;compoent-content&quot;&gt;&lt;label class=&quot;component-icon&quot;&gt;&lt;/label&gt;&lt;span class=&quot;component-name&quot; title=&quot;process&quot;&gt;流程块&lt;/span&gt;&lt;/div&gt;" style="label;whiteSpace=wrap;html=1;;resizable=0;image=../../../../images/icon.jpg" vertex="1" parent="1"><mxGeometry x="322" y="304" width="186" height="55" as="geometry"/><Array as="properties"><Object cnName="标签名称" enName="label" value="流程块" default=""/><Object cnName="输入参数" enName="param" default=""><Array as="value"/></Object><Object cnName="流程块返回" enName="output" default=""><Array as="value"/></Object></Array><Array as="variable"/></mxCell><mxCell id="4" style="exitX=0.5;exitY=1;entryX=0.5;entryY=0;" edge="1" parent="1" source="2" target="3"><mxGeometry relative="1" as="geometry"/></mxCell></root></mxGraphModel>';
      // const xml = mxUtils.getTextContent(div);
      // const xmlDocument = mxUtils.parseXml(xml);
      // const decoder = new MxCodec(xmlDocument);
      // const node = xmlDocument.documentElement;
      // decoder.decode(node, graph.getModel());

      // loadGraph();

      // parseJsonFile();

      if (checkedGraphBlockId) {
        const id = checkedGraphBlockId;
        changeCheckedGraphBlockId(undefined);
        changeCheckedGraphBlockId(id);
      }

      console.log('重新配置graph');

      return () => {
        console.log('移除监听');
        mxEvent.removeAllListeners(document);
      };
    }, []);

    useEffect(() => {
      if (!graph) return;

      // 清空
      graph.removeCells(graph.getChildVertices(graph.getDefaultParent()));

      loadGraph(graphDataRef.current);

      // try {
      //   const cell = find_id(checkedGraphBlockId, graph);

      //   if (cell) {
      //
      //   }
      // } catch (e) {
      //   console.log(e);
      // }

      const zoom =
        localStorage.getItem('zoom') !== null
          ? parseInt(localStorage.getItem('zoom'))
          : 9;
      if (zoom > 9) {
        zoomIn(zoom - 9);
      } else if (zoom < 9) {
        zoomOut(9 - zoom);
      }
      // if (x && y) {
      //   graph.getView().setTranslate(x, y);
      // }
      //undoMng.clear();
      // TODO: 清空撤销恢复池
      changeUndoAndRedo({
        // 第一层撤销重做
        undoSteps: [], // 可以用来重做的步骤
        redoSteps: [], // 可以用来
        counter: 0,
      });

      const cell = find_id(checkedGraphBlockId, graph);

      // 如果cell是个空对象会引发cell.getParent报错的问题
      if (cell.hasOwnProperty('parent')) {
        graph.setSelectionCell(cell);
      }
      // if(cell.has)
      // try {
      //   graph.setSelectionCell(cell);
      // } catch (e) {
      //   console.log(e);
      // }
    }, [currentCheckedTreeNodeRef.current, resetTag]);

    // 有坑
    const resetGraph = (value, id) => {
      const cell = graph.getSelectionCell();
      // const cell = graph.getModel().getCell(id);
      graph.getModel().beginUpdate();
      try {
        if (cell && cell.value && cell.id === id) {
          if (cell.value.indexOf("class='compoent-content'") > -1) {
            cell.value = PROCESS_NODE.getLabel(value);
          } else if (cell.value.indexOf("class='rcomponent-content'") > -1) {
            cell.value = CONDITION_NODE.getLabel(value);
          } else if (cell.value.indexOf("class='group-content'") > -1) {
            cell.value = GROUP_NODE.getLabel(value);
          }
        }
      } finally {
        graph.getModel().endUpdate();
      }
      graph.refresh();
    };

    const configMxCell = () => {
      // 禁用双击编辑
      mxGraph.prototype.isCellEditable = function (cell) {
        //return !this.getModel().isEdge(cell)&&!this.getModel().isVertex(cell);
        return false;
      };

      mxCell.prototype.setNodeType = function (nodetype) {
        this.nodetype = nodetype;
      };
      mxCell.prototype.setComponentType = function (componentType) {
        this.componentType = componentType;
      };
      mxCell.prototype.setNodeId = function (nodeId) {
        this.nodeId = nodeId;
      };
      // 更新组件状态
      mxCell.prototype.updateStatus = function (graph, status) {
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
      mxCell.prototype.setPortIndex = function (portIndex) {
        this.portIndex = portIndex;
      };
      mxCell.prototype.setPortType = function (portType) {
        this.portType = portType;
      };

      // 重写isValidDropTarget方法。加入自定义style.container的判断，只有容器组件可以被拖拽进去
      mxGraph.prototype.isValidDropTarget = function (cell, cells, evt) {
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

      // 判断是否是连线约束点
      mxGraph.prototype.isPort = function (cell) {
        const geo = this.getCellGeometry(cell);

        return geo != null ? geo.relative : false;
      };

      // 添加顶点选中时处理函数
      // mxVertexHandler.prototype.createCustomHandles = function () {
      //   const colorKey = "fillColor";
      //   let color = "#9ed4fb";
      //   let cells = graph.getSelectionCells();

      //   console.log(`我要修改的一群`, cells);

      //   console.log(cells);
      //   // cells.forEach((cell) => {

      //   //   ["ellipse", "label", "rhombus", "group"].forEach((shape) => {
      //   //     console.log(cell.style);
      //   //     const index = cell.style.indexOf(`${shape}`);
      //   //     if (index !== -1) {
      //   //       if (cell.style[index] !== "group") {
      //   //         graph.setCellStyles(colorKey, color, [cell]);
      //   //       }
      //   //     }
      //   //   });
      //   // });
      //   cells = cells.filter((cell) => {
      //     // const style = graph.getCellStyle(cell);
      //     return cell.vertex && !graph.isSwimlane(cell);
      //   });

      //   console.log(cells);
      //   if (cells.length > 0) {
      //     color = "#9ed4fb";
      //     graph.setCellStyles(colorKey, color, cells);
      //   }

      //   //graph.setCellStyles(colorKey, color, cells);
      //   return null;
      // };

      //添加取消选中时处理函数;
      mxSelectionCellsHandler.prototype.eventListeners = [
        'remove',
        (sender, evt) => {
          const { cell } = evt.properties.state;
          if (cell.vertex === false || graph.isSwimlane(cell))
            return cell.vertex && !graph.isSwimlane(cell);

          const colorKey = 'fillColor'; //STYLE_FILLCOLOR
          const color = '#edf6f7';
          const fontColorKey = 'fontColor'; //STYLE_FONTCOLOR;
          const fontColor = '#000';
          setTimeout(() => {
            graph.setCellStyles(colorKey, color, [cell]);
            graph.setCellStyles(fontColorKey, fontColor, [cell]);
          }, 0);
        },
        'add',
        (sender, evt) => {
          const { cell } = evt.properties.state;
          // graph.container.setAttribute('tabindex', '-1');
          // graph.container.focus();
          // graph.removeCellOverlays(cell);

          sender.reset();
          if (cell.vertex === false || graph.isSwimlane(cell))
            return cell.vertex && !graph.isSwimlane(cell);
          const colorKey = 'fillColor';
          const color = '#32A67F';
          const fontColorKey = 'fontColor'; //STYLE_FONTCOLOR;
          const fontColor = '#fff';
          setTimeout(() => {
            graph.setCellStyles(colorKey, color, [cell]);
            graph.setCellStyles(fontColorKey, fontColor, [cell]);
          }, 0);
        },
      ];
    };

    const configLineStyleSheet = () => {
      let style = {};
      graph.getStylesheet().putCellStyle('port', style);
      style = graph.getStylesheet().getDefaultEdgeStyle();
      style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = '#777777';
      style[mxConstants.STYLE_STROKEWIDTH] = '1';
      style[mxConstants.STYLE_STROKECOLOR] = '#777777';
      style[mxConstants.STYLE_FILLCOLOR] = '#ffffff';
      // style[mxConstants.STYLE_EDGE] = mxEdgeStyle.orthogonalEdgeStyle;
      style[mxConstants.STYLE_EDGE] = mxConstants.EDGESTYLE_ORTHOGONAL;
      style[mxConstants.STYLE_JETTY_SIZE] = 'auto';
      style[mxConstants.STYLE_CURVED] = true;
      style[mxConstants.STYLE_FONTSIZE] = '16';
      style[mxConstants.STYLE_FONTCOLOR] = '#32A680';
      style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = 'none';
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
      style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
      style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
      style[mxConstants.STYLE_FILLCOLOR] = '#F2FAF7';
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
      //style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
      style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
      style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_CENTER;

      //style[mxConstants.STYLE_VERTICAL_LABEL_POSITION] = "middle";
      style[mxConstants.STYLE_FONTSTYLE] = 0;

      style[mxConstants.STYLE_FILLCOLOR] = '#F2FAF7';
      style[mxConstants.STYLE_STROKECOLOR] = '#4f9982';
      style[mxConstants.STYLE_FONTCOLOR] = '#000';
      style[mxConstants.STYLE_SWIMLANE_FILLCOLOR] = '#fff';
      style[mxConstants.STYLE_DASHED] = true;
      style[mxConstants.STYLE_ROUNDED] = false;
      style[mxConstants.STYLE_STARTSIZE] = '30';
      style[mxConstants.STYLE_FONTSIZE] = '16';
      // style[mxConstants.STYLE_SHADOW] = true;
      mxConstants.SHADOW_OPACITY = 0.5;
      //style[mxConstants.STYLE_FONTSTYLE] = 1;
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
      //
      const listener = function (sender, evt) {
        undoMng.undoableEditHappened(evt.getProperty('edit'));
      };
      graph.getModel().addListener(mxEvent.UNDO, listener);
      graph.getView().addListener(mxEvent.UNDO, listener);

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

    const configEventHandle = () => {
      const oldMouseMove = mxGraphHandler.prototype.mouseMove;
      // const oldMouseDown = mxGraphHandler.prototype.mouseDown;
      // const oldMouseUp = mxGraphHandler.prototype.mouseUp;
      mxGraphHandler.prototype.mouseMove = function (...args) {
        oldMouseMove.apply(this, args);
        // console.log('move', args);
        const sender = args[0];
        const mouse = args[1];
        if (sender.isMouseDown) {
          if (
            sender.getSelectionCell() &&
            (sender.getSelectionCell().value === '异常处理' ||
              sender.getSelectionCell().value === '结束')
          ) {
            sender.isMouseDown = false;
            graph.refresh();
            // sender.isMouseDown = false;
            // const parent = sender.getSelectionCell().getParent();
            // const parentGeometry = parent.getGeometry();
            // const parentX = parentGeometry.x;
            // const parentY = parentGeometry.y;
            // const parentWidth = parentGeometry.width;
            // const parentHeight = parentGeometry.height;
            // const mouseGraphX = mouse.getGraphX();
            // const mouseGraphY = mouse.getGraphY();
            // if (
            //   mouseGraphX < parentX ||
            //   mouseGraphX > parentX + parentWidth ||
            //   mouseGraphY < parentY ||
            //   mouseGraphY > parentY + parentHeight
            // ) {
            //   sender.isMouseDown = false;
            //   graph.refresh();
            // }

            // console.log('父节点:', parentX, parentY);
            // console.log('鼠标', mouseGraphX, mouseGraphY);
            // console.log(parent)
          }
        }
      };

      // Object.keys(mxEvent).forEach(item => {
      //   if (!item[0].match(/^.*[A-Z]+.*$/)) {
      //     return;
      //   }

      //   console.log(item);
      //   //console.log(_this)

      //   if (item === 'MOUSE_MOVE') return;
      //   if (item === 'FIRE_MOUSE_EVENT') return;

      //   graph.addListener(mxEvent[item], function (sender, evt) {
      //     console.log(`当前执行了`, item, { sender, evt, mxEvent });
      //   });
      //   console.clear();
      // });

      // mxGraphHandler.prototype.mouseDown = function (...args) {
      //   oldMouseDown.apply(this, args);
      //   console.log('down', args);

      //   const sender = args[0];
      //   const mouse = args[1];
      //   if (sender.getSelectionCell()) {
      //     // sender.isMouseDown = false;
      //     // const parent = .getParent();
      //     console.log(sender.getSelectionCell());
      //     console.log(mouse);
      //   }
      // };
      // mxGraphHandler.prototype.mouseUp = function (...args) {
      //   oldMouseUp.apply(this, args);
      //   console.log('up', args);
      // };

      // 监听 - 键盘事件, 删除，复制，粘贴
      mxEvent.addListener(document, 'keydown', function (evt) {
        if (currentPagePositionRef.current === 'block') return;
        // 删除
        if (evt.key === 'Delete') {
          //message.info(`删除 键盘事件${evt.key}`, 1);
          const opt = {};
          Action_DeleteCell(graph, {
            deleteGraphDataMap,
            changeCheckedGraphBlockId,
            graphData: graphDataRef.current,
          });
        }
      });

      mxEvent.addListener(document, 'keyup', evt => {
        // message.success({ content: `按键松了`, key: "keyboard", duration: 1 });
      });

      mxEvent.addListener(document, 'paste', function (evt) {
        if (currentPagePositionRef.current === 'block') return;

        if (evt.target.nodeName === 'PRE' || evt.target.nodeName === 'BODY') {
          //message.warning('粘贴');
          Action_PasteCell(graph, {
            mxClipboard,
            setGraphDataMap,
            changeCheckedGraphBlockId,
            graphData: graphDataRef.current,
            undoAndRedoRef,
          });
          //undoAndRedoRef.current.undoSteps.pop()
          //console.log("粘贴undoAndRedoRefCurrent.undoSteps",undoAndRedoRef.current.undoSteps)
          //undoAndRedoRefCurrent.undoSteps.pop();
          // console.clear();
          // console.log(evt, mxClipboard);
          // setTimeout(() => {
          //   changeUndoAndRedo({
          //     // 第一层撤销重做
          //     undoSteps: [], // 可以用来重做的步骤
          //     redoSteps: [], // 可以用来
          //     counter: 0,
          //   });
          // }, 0);
        } else {
          return;
        }
      });

      mxEvent.addListener(document, 'copy', function (evt) {
        if (currentPagePositionRef.current === 'block') return;

        console.log(evt);

        if (evt.target.nodeName === 'PRE' || evt.target.nodeName === 'BODY') {
          //message.warning('复制');
          Action_CopyCell(graph, { mxClipboard, changeSavingModuleData });
        } else {
          return;
        }
      });

      graph.addListener(mxEvent.PAN, handlePanMove);

      // 连线事件
      graph.addListener(mxEvent.CELL_CONNECTED, (sender, evt) => {
        if (!evt.getProperty('source')) {
          if (!graphDataRef.current) return; //假如graphData还没更新，则不做校验，（因为连线会触发3次）
          // message.info('校验连线');
          // 假如验证不通过，则不允许这条连线出现，直接删除
          const ans = Rule_checkConnection(graph, {
            evt,
            graphData: graphDataRef.current,
          });

          // 验证不通过，删除连线
          if (!ans) {
            setTimeout(() => {
              graph.removeCells([evt.properties.edge]);
              undoAndRedoRef.current.undoSteps.pop();
              graph.refresh();
              updateGraphDataAction(graph);
            });

            return;
          }

          // TODO: 假如成功了，则同步更新到grapDataMap
          if (ans.rule === '判断') {
            //   `假如是判断块，要触发判断逻辑，把连线改成是否`,
            evt.properties.edge.setValue(ans.type);
          }
          //console.clear();
          console.log(evt);

          console.log(`连线`, sender, evt, undoAndRedoRef.current);
          let temp = undoAndRedoRef.current;
          temp.undoSteps.push([
            {
              type: 'connectLine',
              counter: undoAndRedoRef.current.counter,
              change: {
                counter: undoAndRedoRef.current.counter,
                line_id: evt.properties.edge.id,
                line_cell: evt.properties.edge,
                line_value: evt.properties.edge.value,
                source_id: evt.properties.edge.source.id,
                source_cell: evt.properties.edge.source,
                target_id: evt.properties.edge.target.id,
                target_cell: evt.properties.edge.target,
              },
            },
          ]);
          //undoAndRedoRef.current.counter += 1;

          // 更新graphData数据
          updateGraphDataAction(graph);
        } else {
          return false;
        }
        return;
      });

      mxGraphHandler;

      // 监听 - 双击事件CLICK
      graph.addListener(mxEvent.DOUBLE_CLICK, (sender, evt) => {
        const cell = evt.getProperty('cell');
        if (cell != null) {
          if (cell.vertex) {
            // console.log(graphDataMapRef);
            // console.clear();
            // console.log('双击', cell);
            // 将这个节点对应的card等等数据同步到全局

            const cellId = cell.id;

            // 假如是流程块，则进入

            // TODO：1， 检测当前选中的元素是否是流程快
            if (
              evt.properties.cell.value.indexOf(
                `span class='component-name' title='process'`
              ) === -1
            ) {
              return message.info('只有流程块能双击进入编辑');
            }

            // TODO：2， Redux更新当前块并切换id
            // if (
            //   // node.item &&
            //   ["processblock", "rhombus-node"].includes(data.shape)
            // ) {
            //   changeCheckedGraphBlockId(cellId);

            // }
            synchroCodeBlock(graphDataMapRef.current.get(cellId));

            updateCurrentPagePosition('block');
            // TODO：3， 进入流程块
            Promise.resolve(true)
              .then(() => {
                history.push('/designGraph/block');
                return true;
              })
              .catch(err => console.log(err));
          }
        }
      });

      graph.addListener(mxEvent.CLICK, (sender, evt) => {
        console.log('点击');
        const cell = evt.getProperty('cell');
        console.log(cell);
        if (cell != null) {
          if (!cell.vertex) return;

          const x =
            -cell.geometry.x +
            (document.querySelector('#graphContainer').clientWidth -
              cell.geometry.width) /
              2;
          const y =
            -cell.geometry.y +
            (document.querySelector('#graphContainer').clientHeight -
              cell.geometry.height) /
              2;
          // graph.getView().setTranslate(x, y);
          // localStorage.setItem('graphX', x);
          // localStorage.setItem('graphY', y);
          console.log(x, y);

          const overlays = graph.getCellOverlays(cell);
          // 排除连接点和连接线
          const isPort = graph.isPort(cell);

          let data = undefined;
          let cellId = undefined;

          // const cellId = cell.mxObjectId;
          if (graphDataMapRef.current.get(cell.mxObjectId)) {
            data = graphDataMapRef.current.get(cell.mxObjectId);
            cellId = cell.mxObjectId;
          } else {
            data = graphDataMapRef.current.get(cell.id);
            cellId = cell.id;
          }

          if (
            // node.item &&
            data &&
            ['processblock', 'rhombus-node', 'group'].includes(data.shape)
          ) {
            changeCheckedGraphBlockId(cellId);
            synchroCodeBlock(graphDataMapRef.current.get(cellId));
          } else {
            changeCheckedGraphBlockId('');
          }

          if (overlays == null && !isPort) {
            // Creates a new overlay with an image and a tooltip
            const overlay = new MxCellOverlay(
              new MxImage(checkPng.default, 16, 16),
              'Overlay tooltip'
            );

            // Installs a handler for clicks on the overlay
            /* overlay.addListener(mxEvent.CLICK, function(sender, evt2) {
          // mxUtils.alert('Overlay clicked');
        }); */

            // Sets the overlay for the cell in the graph
            // 添加勾子的图片
            // graph.addCellOverlay(cell, overlay);
          } else {
            // graph.removeCellOverlays(cell);
          }
        } else {
          changeCheckedGraphBlockId('');
        }
      });

      // 添加
      // graph.addListener(mxEvent.CELLS_ADDED, (sender, evt) => {
      //   updateGraphDataAction(graph);
      //   console.log('添加', sender, evt);

      //   let temp = undoAndRedoRef.current;
      //   //setTimeout(()=>{
      //   // temp.undoSteps.push(
      //   //   evt.properties.cells.map(cell => {
      //   //     return {
      //   //       type: 'cellsAdded',
      //   //       counter: undoAndRedoRef.current.counter,
      //   //       change: {
      //   //         counter: undoAndRedoRef.current.counter,
      //   //         vertex: cell.isVertex(),

      //   //         // 恢复块所需要的数据
      //   //         geometry: cell.geometry,
      //   //         id: cell.id,
      //   //         style: cell.style,
      //   //         value: cell.value,

      //   //         // 恢复线所需要的数据
      //   //         source_id: cell.source ? cell.source.id : null,
      //   //         target_id: cell.target ? cell.target.id : null,
      //   //         value: cell.value,

      //   //         cell: cell,
      //   //         // deepCopy一下当时的dataGraph
      //   //       },
      //   //     };
      //   //   })
      //   // );
      //   //},0)
      //   undoAndRedoRef.current.counter += 1;

      //   // updateGraphDataAction(graph);
      //   changeModifyState(
      //     processTreeRef.current,
      //     currentCheckedTreeNodeRef.current,
      //     true
      //   );
      // });

      // graph.addListener(mxEvent.CELLS_ADDED, (sender, evt) => {
      //   //console.log('改变大小', sender, evt);
      //   if(evt.properties.cells[0].parent.id === "1") return;
      //   console.clear();
      //   console.log(evt.properties.cells[0].parent.id);
      //   const ans = Rule_sizeRule(graph, {
      //     evt,
      //     graphData: graphDataRef.current,
      //     updateGraphDataAction,
      //   });

      // });

      // layoutManagerRef.current.cellsMoved = (cells, evt) => {
      //   let targetEdges = [];
      //   cells.forEach(cell => {
      //     // 父节点不是原来的背景板，移入了容器
      //     if (cell.getParent().id !== '1') {
      //       targetEdges = graphDataRef.current.edges.filter(
      //         item => item.target === cell.id || item.source === cell.id
      //       );
      //       console.log(targetEdges);
      //       targetEdges.forEach(item => {
      //         graph.removeCells([find_id(item.id, graph)]);
      //         deleteFromMxModel(item.id, graph); //从mxGraph的Model里面删掉
      //       });
      //       updateGraphDataAction(graph);
      //     }
      //   });
      // };
      // layoutManagerRef.current.getCellsForChanges = changes => {
      //   console.log(changes);
      // };

      // 移动 CELLS_MOVED MOVE_CELLS
      graph.addListener(mxEvent.CELLS_MOVED, (sender, evt) => {
        graph.fireEvent(new mxEventObject('get_mouse'));
        setTimeout(() => {
          updateGraphDataAction(graph);
        }, 0);
        // console.log('\n\n\n\n 更新啊啊啊啊啊啊 \n\n\n');

        // 要区别2种move，假如没有target，则是正常move
        // 有target，则是新增

        changeModifyState(
          processTreeRef.current,
          currentCheckedTreeNodeRef.current,
          true
        );

        let temp = undoAndRedoRef.current;

        //console.clear();
        console.log(`【移动】纯移动`, sender, evt, undoAndRedoRef.current);

        // 假如被移动的时
        // try{
        //   if (evt.properties.cells[0].parent.id !== '1') {
        //     message.info('这个元素有爸爸，需要对其进行容器扩大检查');
        //     Rule_move_sizeRule(
        //       evt.properties.cells[0].id,
        //       evt.properties.cells[0].parent.id,
        //       {
        //         graphData: graphDataRef.current,
        //         graph: sender,
        //         evt,
        //         updateGraphDataAction,
        //       }
        //     );
        //   }

        // }catch(e){
        //   console.log(e)
        // }

        // const previous = graphDataRef.current;

        if (evt.properties.cells > 0) {
          if (!evt.properties.cells[0].id) {
            return '妈的，没有id';
          }
        }

        temp.undoSteps.push(
          evt.properties.cells.map(cell => {
            const previous = graphDataRef.current.nodes.find(node => {
              return node.id === cell.id;
            });

            return {
              type: 'move',
              counter: undoAndRedoRef.current.counter,
              change: {
                counter: undoAndRedoRef.current.counter,
                id: cell ? cell.id : 'xxx',
                cell: cell ? cell : undefined,
                geometry: {
                  x: cell ? cell.geometry.x : 'xxx',
                  y: cell ? cell.geometry.y : 'xxx',

                  parent_x: previous ? previous.x : 'xxx',
                  parent_y: previous ? previous.y : 'xxx',

                  dx: cell ? evt.properties.dx : 'xxx',
                  dy: cell ? evt.properties.dy : 'xxx',

                  width: cell.geometry.width,
                  height: cell.geometry.height,
                },

                //---
                cell: cell,
                value: cell.value,
                style: cell.style,
                parent: cell.parent ? cell.parent : getTempCellParent(),
                parent_id: cell.parent
                  ? cell.parent.id
                  : getTempCellParent()
                  ? getTempCellParent().id
                  : '1', // getTempCellParent().id,
                children: cell.children
                  ? [cell.children[0], cell.children[1]]
                  : null,
                previous: previous,
              },
            };
          })
        );

        undoAndRedoRef.current.counter += 1;
      });

      // 添加
      // graph.addListener(mxEvent.CELLS_ADDED, (sender, evt) => {
      //   console.log('添加', sender);
      //   // updateGraphDataAction(graph);
      //   changeModifyState(
      //     processTreeRef.current,
      //     currentCheckedTreeNodeRef.current,
      //     true
      //   );
      // });

      // 删除，仅用于撤销恢复
      graph.addListener(mxEvent.CELLS_REMOVED, (sender, evt) => {
        let temp = undoAndRedoRef.current;
        console.log(`删除操作`, graphDataRef.current, evt, getTempCellParent());
        temp.undoSteps.push(
          evt.properties.cells.map(cell => {
            const previous = null;
            //  graphDataRef.current.nodes.find(node => {
            //   return node.id === cell.id;
            // });

            return {
              type: 'remove',
              counter: undoAndRedoRef.current.counter,
              change: {
                counter: undoAndRedoRef.current.counter,
                vertex: cell.isVertex(),

                // 恢复块所需要的数据
                geometry: {
                  ...cell.geometry,
                },
                geometry_parent: {
                  parent_x: previous ? previous.x : 0,
                  parent_y: previous ? previous.y : 0,
                },
                id: cell.id,
                style: cell.style,
                value: cell.value,

                // 恢复线所需要的数据
                source_id: cell.source ? cell.source.id : null,
                target_id: cell.target ? cell.target.id : null,
                value: cell.value,

                cell: cell,
                parent: cell.parent ? cell.parent : getTempCellParent(),
                parent_id: cell.parent
                  ? cell.parent.id
                  : getTempCellParent()
                  ? getTempCellParent().id
                  : '1', // getTempCellParent().id,
                children: cell.children
                  ? [cell.children[0], cell.children[1]]
                  : null,
                // deepCopy一下当时的dataGraph
              },
            };
          })
        );
      });

      // 删除
      graph.addListener('delete_cells', () => {
        changeModifyState(
          processTreeRef.current,
          currentCheckedTreeNodeRef.current,
          true
        );
      });

      // 更新
      graph.addListener('update_graphData', () => {
        const output = translateToGraphData(graph.getModel(), graph);
        if (output) {
          updateGraphData(output);
          synchroGraphDataToProcessTree();
        }
      });

      graph.addListener(mxEvent.CELLS_ADDED, (sender, evt) => {
        // message.info("触发了这个")

        // 当前被拖动的cell
        const cell = evt.properties.cells.length
          ? evt.properties.cells[0]
          : undefined;
        // 新的parent
        const newParent = evt.properties.parent
          ? evt.properties.parent
          : undefined;
        // 存在graphData里面未被改动cell，如果是从工具栏拖下来则为undefined
        const graphDataCell = graphDataRef.current.nodes.find(
          item => item.id === cell.id
        );

        if (cell && newParent) {
          // console.clear();
          if (newParent.value) {
            const parentGeometry = newParent.getGeometry();
            const cellGeometry = cell.getGeometry();
            if (parentGeometry && cellGeometry) {
              const parentX = parentGeometry.x;
              const parentY = parentGeometry.y;
              const parentWidth = parentGeometry.width;
              const parentHeight = parentGeometry.height;

              const cellX = cellGeometry.x;
              const cellY = cellGeometry.y;
              const cellWidth = cellGeometry.width;
              const cellHeight = cellGeometry.height;

              const middleWidth = getMiddleWidth(cellWidth, parentWidth);

              const arr = getSibilings(
                graphDataRef.current,
                cell.id,
                newParent.id
              );

              const lastHeight = getLastHeight(
                cellHeight,
                parentHeight,
                cellY,
                parentY,
                arr,
                sender
              );

              // 把流程块移动到中间
              graph.moveCells([cell], middleWidth - cellX, lastHeight - cellY);

              console.log(`别再删了，求求你了`);

              // [这个步骤不记录在撤销回复中]
              let temp = undoAndRedoRef.current;
              if (temp.redoSteps.length > 0) {
                console.log(
                  '进这里',
                  temp.redoSteps[temp.redoSteps.length - 1][0]
                );
                if (
                  temp.redoSteps[temp.redoSteps.length - 1][0].type ===
                  'cellsAdded_By_redo'
                ) {
                  // 假如是恢复出来的，不要删
                  //message.warning("我没删")
                  console.log('key 我没删哦', temp);
                } else {
                  if (
                    temp.redoSteps[temp.redoSteps.length - 1][0].type ===
                      'moveParent' ||
                    temp.redoSteps[temp.redoSteps.length - 1][0].type ===
                      'remove'
                  ) {
                  } else {
                    temp.undoSteps.pop();
                  }
                }
              } else {
                console.log(
                  `别再删了，求求你了`,
                  temp.undoSteps[temp.undoSteps.length - 1]
                );

                if (temp.undoSteps[temp.undoSteps.length - 1].stopPop) {
                } else {
                  temp.undoSteps.pop();
                }
              }

              /**
               * 1.循环自动扩容，直接判断lastHeight是否比父级高度大即可
               * 2.try自动扩容，判断lastHeight是否比（父级高度 - catch高度 - finally高度）大，大了则扩容，catch和finally也要做相应扩容
               */

              // 判断是否try，如果是try的话，catch和finally也要向下位移
              if (newParent.value === '异常捕获') {
                // catch和finally的高的和
                let catchAndFinallyHeight = 0;
                // graphData里面
                const graphDataChildren = graphDataRef.current.nodes.filter(
                  item =>
                    item.parent === newParent.id &&
                    (item.label === '结束' || item.label === '异常处理')
                );
                const cellArr = graphDataChildren.map(element => {
                  const child = find_id(element.id, sender);
                  const childGeo = child.getGeometry();
                  catchAndFinallyHeight += childGeo.height;
                  return child;
                });

                if (
                  lastHeight + cellHeight >
                  parentHeight - catchAndFinallyHeight
                ) {
                  parentGeometry.height = parentHeight + cellHeight + 20;
                  graph.resizeCells([newParent], parentGeometry);

                  cellArr.forEach(child => {
                    graph.moveCells([child], 0, cellHeight + 20);

                    // [这个步骤不记录在撤销回复中]
                    let temp = undoAndRedoRef.current;
                    temp.undoSteps.pop();
                  });
                }
              } else {
                if (lastHeight + cellHeight > parentHeight) {
                  const oldParentHeight = parentGeometry.height;
                  parentGeometry.height = lastHeight + cellHeight + 20;
                  graph.resizeCells([newParent], parentGeometry);
                  if (newParent.value === '异常处理') {
                    // catch变高之后的操作
                    const catchParentGeo = newParent.parent.getGeometry();
                    catchParentGeo.height =
                      catchParentGeo.height +
                      parentGeometry.height -
                      oldParentHeight;

                    const graphDataSibilling = graphDataRef.current.nodes.find(
                      item =>
                        item.parent === newParent.parent.id &&
                        item.label === '结束'
                    );
                    const sibiling = find_id(graphDataSibilling.id, sender);

                    graph.moveCells(
                      [sibiling],
                      0,
                      parentGeometry.height - oldParentHeight
                    );

                    // [这个步骤不记录在撤销回复中]
                    let temp = undoAndRedoRef.current;
                    temp.undoSteps.pop();

                    // 修改父级try的高度
                    graph.resizeCells([newParent.parent], catchParentGeo);
                  } else if (newParent.value === '结束') {
                    // finally变高之后的操作
                    const finallyParentGeo = newParent.parent.getGeometry();
                    finallyParentGeo.height =
                      finallyParentGeo.height +
                      parentGeometry.height -
                      oldParentHeight;
                    // 修改父级try的高度
                    graph.resizeCells([newParent.parent], finallyParentGeo);
                  }
                }
              }
              updateGraphDataAction(graph);

              console.log('父坐标', parentX, parentY);
              console.log('子坐标', cellX, cellY);
            }
          }
          // 父节点变更，断开连线
          if (graphDataCell) {
            let targetEdges = [];
            if (newParent.id !== graphDataCell.parent) {
              targetEdges = graphDataRef.current.edges.filter(
                item => item.target === cell.id || item.source === cell.id
              );
              console.log(targetEdges);
              targetEdges.forEach(item => {
                graph.removeCells([find_id(item.id, graph)]);
                deleteFromMxModel(item.id, graph); //从mxGraph的Model里面删掉
                undoAndRedoRef.current.undoSteps.pop();
              });
              updateGraphDataAction(graph);
            }
          }
        }

        console.log(`\n\n\n\n是插入哦`, undoAndRedoRef.current);

        let temp = undoAndRedoRef.current;
        if (temp.undoSteps.length > 0) {
          if (temp.undoSteps[temp.undoSteps.length - 1][0].type === 'move') {
            // 假如这个属于父子移动拖拽的有儿子，则不记录这步
            console.log(
              '假如这个属于父子移动拖拽的有儿子，则不记录这步',
              temp.undoSteps[temp.undoSteps.length - 1][0].change.cell
            );
            if (
              temp.undoSteps[temp.undoSteps.length - 1][0].change.cell.children
            ) {
              if (
                temp.undoSteps[temp.undoSteps.length - 1][0].change.cell
                  .children.length !== 0
              ) {
                console.clear();
                console.log('移除掉');
                return temp.undoSteps.pop();
              }
            }

            temp.undoSteps[temp.undoSteps.length - 1][0].type = 'moveParent';
            temp.undoSteps[temp.undoSteps.length - 1][0].change.toId =
              newParent.id;
            temp.undoSteps[
              temp.undoSteps.length - 1
            ][0].change.toId_cellGeometry = evt.properties.cells[0].geometry;
          }
        }
        //

        // if (
        //   cell &&
        //   parent &&
        //   graphDataCell &&
        //   (cell.value === 'catch' || cell.value === 'finally')
        // ) {
        //   if (parent.id === '1' && parent.id !== graphDataCell.parent) {
        //     console.log('parent不一样，被拖出了容器');
        //     const oldParent = find_id(graphDataCell.parent, sender);
        //     console.log('newparent', parent);
        //     console.log('oldparent', oldParent);

        //     let temp = undoAndRedoRef.current;
        //     console.log(`跨层移动`, sender, evt, undoAndRedoRef.current);
        //     temp.undoSteps.push(
        //       evt.properties.cells.map(cell => {
        //         return {
        //           type: 'moveParent',
        //           counter: undoAndRedoRef.current.counter,
        //           change: {
        //             counter: undoAndRedoRef.current.counter,
        //             id: cell ? cell.id : 'xxx',
        //             cell: cell ? cell : undefined,
        //             // geometry: {
        //             //   x: cell ? cell.geometry.x : 'xxx',
        //             //   y: cell ? cell.geometry.y : 'xxx',
        //             //   dx: cell ? evt.properties.dx : 'xxx',
        //             //   dy: cell ? evt.properties.dy : 'xxx',
        //             // },
        //           },
        //         };
        //       })
        //     );

        //   }
        // }
      });

      graph.addListener(mxEvent.CELLS_RESIZED, (sender, evt) => {
        console.log('改变大小', sender, evt);
        const cell = evt.properties.cells.length
          ? evt.properties.cells[0]
          : undefined;
        const previous = evt.properties.previous.length
          ? evt.properties.previous[0]
          : undefined;
        const bounds = evt.properties.bounds.length
          ? evt.properties.bounds[0]
          : undefined;
        const cells = sender.getModel().cells;
        // 对异常捕获块进行尺寸重置
        if (cell.value === '异常捕获') {
          const graphDataChildren = graphDataRef.current.nodes.filter(
            item =>
              item.parent === cell.id &&
              (item.label === '结束' || item.label === '异常处理')
          );
          graphDataChildren.forEach(element => {
            const child = find_id(element.id, sender);
            const childGeo = child.getGeometry();
            childGeo.width = bounds.width;
            graph.moveCells([child], 0, bounds.height - previous.height);

            // [这个步骤不记录在撤销回复中]
            let temp = undoAndRedoRef.current;
            temp.undoSteps.pop();

            graph.resizeCells([child], childGeo);
          });
        }
      });
    };

    const loadGraph = graphData => {
      // const jsonFile = fs.readFileSync('D:/临时文件存放/test.json');
      // 获得流程
      // const graphData = jsonFile ? JSON.parse(jsonFile).graphData : {};
      // console.clear();

      const readCodec = new MxCodec();

      // 获得当前graph的XmlDom
      const node = readCodec.encode(graph.getModel());

      // XmlDom转换成字符串
      // const xml = mxUtils.getXml(node);

      // xmlDom转换的json结构
      const json = x2js.dom2js(node);

      let nodes = [];
      let edges = [];
      let newNodes = [];
      let newEdges = [];

      // TODO: 加入try catch
      try {
        nodes = graphData.nodes ? graphData.nodes : [];
        edges = graphData.edges ? graphData.edges : [];

        // console.log(edges);
        // console.log(x2js.dom2js(node));

        newNodes = nodes.map(item => {
          const obj = {};
          if (item.shape === 'processblock') {
            const labelStr = PROCESS_NODE.label;
            obj._id = item.id;
            obj._parent = item.parent !== undefined ? item.parent : '1';
            obj._style = PROCESS_NODE.style;
            // obj._value = labelStr.replace('流程块', item.label);
            // obj._value = item.version
            //   ? item.label
            //   : labelStr.replace('流程块', item.label);
            obj._value = PROCESS_NODE.getLabel(item.label);
            obj._vertex = '1';
            obj.mxGeometry = {};
            obj.mxGeometry._x = String(item.x);
            obj.mxGeometry._y = String(item.y);
            obj.mxGeometry._width = String(PROCESS_NODE.width);
            obj.mxGeometry._height = String(PROCESS_NODE.height);
            obj.mxGeometry._as = 'geometry';
          } else if (item.shape === 'rhombus-node') {
            obj._id = item.id;
            obj._parent = item.parent !== undefined ? item.parent : '1';
            obj._style = CONDITION_NODE.style;
            obj._value = CONDITION_NODE.getLabel(item.label);
            obj._vertex = '1';
            obj.mxGeometry = {};
            obj.mxGeometry._x = String(item.x);
            obj.mxGeometry._y = String(item.y);
            obj.mxGeometry._width = String(CONDITION_NODE.width);
            obj.mxGeometry._height = String(CONDITION_NODE.height);
            obj.mxGeometry._as = 'geometry';
          } else if (item.shape === 'start-node') {
            obj._id = item.id;
            obj._parent = item.parent !== undefined ? item.parent : '1';
            obj._style = START_NODE.style;
            obj._value = START_NODE.label;
            obj._vertex = '1';
            obj.mxGeometry = {};
            obj.mxGeometry._x = String(item.x);
            obj.mxGeometry._y = String(item.y);
            obj.mxGeometry._width = String(START_NODE.width);
            obj.mxGeometry._height = String(START_NODE.height);
            obj.mxGeometry._as = 'geometry';
          } else if (item.shape === 'end-node') {
            obj._id = item.id;
            obj._parent = item.parent !== undefined ? item.parent : '1';
            obj._style = END_NODE.style;
            obj._value = END_NODE.label;
            obj._vertex = '1';
            obj.mxGeometry = {};
            obj.mxGeometry._x = String(item.x);
            obj.mxGeometry._y = String(item.y);
            obj.mxGeometry._width = String(END_NODE.width);
            obj.mxGeometry._height = String(END_NODE.height);
            obj.mxGeometry._as = 'geometry';
          } else if (item.shape === 'try') {
            const sizes = item.size.split('*');
            obj._id = item.id;
            obj._parent = item.parent !== undefined ? item.parent : '1';
            obj._style = GROUP_NODE.style;
            obj._value = '异常捕获';
            obj._vertex = '1';
            obj.mxGeometry = {};
            obj.mxGeometry._x = String(item.x);
            obj.mxGeometry._y = String(item.y);
            obj.mxGeometry._width = String(sizes[0]);
            obj.mxGeometry._height = String(sizes[1]);
            obj.mxGeometry._as = 'geometry';
          } else if (item.shape === 'catch') {
            const sizes = item.size.split('*');
            obj._id = item.id;
            obj._parent = item.parent !== undefined ? item.parent : '1';
            obj._style =
              GROUP_NODE.style.replace('shadow=1', '') + 'resizable=0';
            obj._value = '异常处理';
            obj._vertex = '1';
            obj.mxGeometry = {};
            obj.mxGeometry._x = String(item.x);
            obj.mxGeometry._y = String(item.y);
            obj.mxGeometry._width = String(sizes[0]);
            obj.mxGeometry._height = String(sizes[1]);
            obj.mxGeometry._as = 'geometry';
          } else if (item.shape === 'finally') {
            const sizes = item.size.split('*');
            obj._id = item.id;
            obj._parent = item.parent !== undefined ? item.parent : '1';
            obj._style =
              GROUP_NODE.style.replace('shadow=1', '') + 'resizable=0';
            obj._value = '结束';
            obj._vertex = '1';
            obj.mxGeometry = {};
            obj.mxGeometry._x = String(item.x);
            obj.mxGeometry._y = String(item.y);
            obj.mxGeometry._width = String(sizes[0]);
            obj.mxGeometry._height = String(sizes[1]);
            obj.mxGeometry._as = 'geometry';
          } else if (item.shape === 'group') {
            const sizes = item.size.split('*');
            obj._id = item.id;
            obj._parent = item.parent !== undefined ? item.parent : '1';
            obj._style = GROUP_NODE.style;
            obj._value = GROUP_NODE.getLabel(item.label);
            obj._vertex = '1';
            obj.mxGeometry = {};
            obj.mxGeometry._x = String(item.x);
            obj.mxGeometry._y = String(item.y);
            obj.mxGeometry._width = String(sizes[0]);
            obj.mxGeometry._height = String(sizes[1]);
            obj.mxGeometry._as = 'geometry';
          } else if (item.shape === 'break-node') {
            obj._id = item.id;
            obj._parent = item.parent !== undefined ? item.parent : '1';
            obj._style = BREAK_NODE.style;
            obj._value = BREAK_NODE.label;
            obj._vertex = '1';
            obj.mxGeometry = {};
            obj.mxGeometry._x = String(item.x);
            obj.mxGeometry._y = String(item.y);
            obj.mxGeometry._width = String(BREAK_NODE.width);
            obj.mxGeometry._height = String(BREAK_NODE.height);
            obj.mxGeometry._as = 'geometry';
          } else if (item.shape === 'continue-node') {
            obj._id = item.id;
            obj._parent = item.parent !== undefined ? item.parent : '1';
            obj._style = CONTINUE_NODE.style;
            obj._value = CONTINUE_NODE.label;
            obj._vertex = '1';
            obj.mxGeometry = {};
            obj.mxGeometry._x = String(item.x);
            obj.mxGeometry._y = String(item.y);
            obj.mxGeometry._width = String(CONTINUE_NODE.width);
            obj.mxGeometry._height = String(CONTINUE_NODE.height);
            obj.mxGeometry._as = 'geometry';
          }
          return obj;
        });

        newEdges = edges.map(item => {
          const obj = {};
          let point = '';
          obj._id = item.id;
          obj._parent = '1';
          obj._edge = '1';
          obj._source = item.source;
          obj._target = item.target;
          obj._value = item.label ? item.label : '';
          obj.mxGeometry = {};
          obj.mxGeometry._as = 'geometry';
          obj.mxGeometry._relative = '1';
          switch (item.sourceAnchor) {
            case 0:
              point += POINT_POSITION_EXIT.TOP + POINT_POSITION_EXIT.NORMAL;
              break;
            case 1:
              point += POINT_POSITION_EXIT.BOTTOM + POINT_POSITION_EXIT.NORMAL;
              break;
            case 2:
              point += POINT_POSITION_EXIT.LEFT + POINT_POSITION_EXIT.NORMAL;
              break;
            case 3:
              point += POINT_POSITION_EXIT.RIGHT + POINT_POSITION_EXIT.NORMAL;
              break;
            default:
              break;
          }
          switch (item.targetAnchor) {
            case 0:
              point += POINT_POSITION_ENTRY.TOP + POINT_POSITION_ENTRY.NORMAL;
              break;
            case 1:
              point +=
                POINT_POSITION_ENTRY.BOTTOM + POINT_POSITION_ENTRY.NORMAL;
              break;
            case 2:
              point += POINT_POSITION_ENTRY.LEFT + POINT_POSITION_ENTRY.NORMAL;
              break;
            case 3:
              point += POINT_POSITION_ENTRY.RIGHT + POINT_POSITION_ENTRY.NORMAL;
              break;
            default:
              break;
          }
          obj._style = point;
          return obj;
        });

        // json.root.mxCell = [...json.root.mxCell]
        //   .concat(newNodes)
        //   .concat(newEdges);
      } catch (e) {
        message.error('图转换出错');
        console.log(e);
      }

      //TODO: try catch到此处

      const newJson = {};
      newJson.mxGraphModel = {};
      // newJson.mxGraphModel.root = json.root;
      newJson.mxGraphModel.root = {};

      const basicArr = [
        {
          _id: '0',
        },
        {
          _id: '1',
          _parent: '0',
        },
      ];

      newJson.mxGraphModel.root.mxCell = basicArr.concat(newNodes, newEdges);

      const xml = x2js.js2xml(newJson);
      // const xml = mxUtils.getTextContent(div);

      // console.log(xml);
      const xmlDoc = mxUtils.parseXml(xml);
      const writeCodec = new MxCodec(xmlDoc);
      writeCodec.decode(xmlDoc.documentElement, graph.getModel());

      try {
        const zoom = graphData.zoom ? parseInt(graphData.zoom) : 9;
        setZoomLevel(zoom);
        localStorage.setItem('zoom', zoom);
      } catch (e) {
        console.log(e);
        setZoomLevel(9);
        localStorage.setItem('zoom', 9);
      }

      if (graphData && graphData.translate) {
        if (graphData.translate.x && graphData.translate.y) {
          console.log(
            parseInt(graphData.translate.x),
            parseInt(graphData.translate.y)
          );
          setTimeout(() => {
            graph
              .getView()
              .setTranslate(
                parseInt(graphData.translate.x),
                parseInt(graphData.translate.y)
              );
          }, 0);
        }
      }
    };

    // const loadGraph = () => {
    //   // const xmlReq = mxUtils.load('D:/临时文件存放/fgh.xml');
    //   const xmlReq = mxUtils.load('D:/临时文件存放/fgh.xml');
    //   const root = xmlReq.getDocumentElement();
    //   const dec = new MxCodec(root);
    //   dec.decode(root, graph.getModel());
    // };

    const handleZoomIn = frequency => {
      changeModifyState(
        processTreeRef.current,
        currentCheckedTreeNodeRef.current,
        true
      );
      zoomIn(frequency);
      updateGraphDataAction(graph);
    };

    const handleZoomOut = frequency => {
      changeModifyState(
        processTreeRef.current,
        currentCheckedTreeNodeRef.current,
        true
      );
      zoomOut(frequency);
      updateGraphDataAction(graph);
    };

    const zoomIn = frequency => {
      for (let i = 0; i < frequency; i += 1) graph.zoomIn();
    };

    const zoomOut = frequency => {
      for (let i = 0; i < frequency; i += 1) graph.zoomOut();
    };

    /**
     * 判断是否是可容纳组件
     * @param {mxCell} cell 单元
     */
    const isContainer = cell => {
      const style = graph.getCellStyle(cell);

      if (graph.isSwimlane(cell)) {
        return style.container !== 0;
      } else {
        return style.container === 1;
      }
    };

    const createDragSource = (elt, dropHandler, preview, cells, bounds) => {
      let firstVertex = null;
      let activeArrow = null;

      // 获得单元格组中的顶点单元格索引
      for (let i = 0; i < cells.length; i += 1) {
        if (firstVertex == null && graph.model.isVertex(cells[i])) {
          firstVertex = i;
        }
        if (firstVertex !== null) {
          break;
        }
      }

      // 成功拖拽后的回调方法
      const funt = mxUtils.bind(this, function (...args) {
        dropHandler.apply(this, args);
      });

      // 将给定的DOM元素elt配置为指定图形的拖动源preview。返回一个新的mxDragSource。scalePreview缩放设置，highlightDropTargets高亮拖拽目标
      const dragX = 0;
      const dragY = 0;
      const scalePreview = true;
      const highlightDropTargets = true;

      const dragSource = mxUtils.makeDraggable(
        elt,
        graph,
        funt,
        preview,
        dragX,
        dragY,
        graph.autoscroll,
        scalePreview,
        highlightDropTargets
      );

      dragSource.dragOver = function (...args) {
        mxDragSource.prototype.dragOver.apply(this, args);
      };

      // 仅当拖拽目标是一个合法根的时候可以拖进
      dragSource.getDropTarget = mxUtils.bind(this, function (
        graph,
        x,
        y,
        evt
      ) {
        // Alt表示没有目标
        // 得到与x，y相交的底层单元格
        let cell =
          !mxEvent.isAltDown(evt) && cells !== null
            ? graph.getCellAt(x, y)
            : null;

        // 使用可连接的父顶点（如果存在）
        if (cell !== null && !graph.isCellConnectable(cell)) {
          const parent = graph.getModel().getParent(cell);

          if (
            graph.getModel().isVertex(parent) &&
            graph.isCellConnectable(parent)
          ) {
            cell = parent;
          }
        }

        // 忽略锁定的单元格
        if (graph.isCellLocked(cell)) {
          cell = null;
        }
        activeArrow = null;

        // 处理拖拽容器
        let target =
          !mxEvent.isAltDown(evt) || mxEvent.isShiftDown(evt)
            ? mxDragSource.prototype.getDropTarget.apply(this, arguments)
            : null;
        const model = graph.getModel();
        if (target !== null) {
          if (
            activeArrow !== null ||
            !graph.isSplitTarget(target, cells, evt)
          ) {
            // Selects parent group as drop target
            while (
              target !== null &&
              !graph.isValidDropTarget(target, cells, evt) &&
              model.isVertex(model.getParent(target))
            ) {
              target = model.getParent(target);
            }

            if (
              target !== null &&
              (graph.view.currentRoot == target ||
                (!graph.isValidRoot(target) &&
                  graph.getModel().getChildCount(target) == 0) ||
                graph.isCellLocked(target) ||
                model.isEdge(target) ||
                !graph.isValidDropTarget(target, cells, evt))
            ) {
              target = null;
            }
          }
        }

        return target;
      });

      return dragSource;
    };

    // 创建处理拖拽后的回调函数
    const createDropHandler = (
      cells,
      allowSplit,
      allowCellsInserted,
      bounds
    ) => {
      const allowCellsInsertedValue =
        allowCellsInserted !== null ? allowCellsInserted : true;

      // 更新视图
      return mxUtils.bind(this, function (graph, evt, target, x, y, force) {
        let elt = null;
        if (!force) {
          elt = mxEvent.isTouchEvent(evt) /* || mxEvent.isPenEvent(evt) */
            ? document.elementFromPoint(
                mxEvent.getClientX(evt),
                mxEvent.getClientY(evt)
              )
            : mxEvent.getSource(evt);
        }

        // 未知作用：elt !== container container从外部传进来
        while (elt !== null && elt !== undefined) {
          elt = elt.parentNode;
        }

        if (elt == null && graph.isEnabled()) {
          const importableCells = graph.getImportableCells(cells);

          // 拦截，只能有一个开始和结束
          // console.log(`ok`, importableCells[0], graphDataRef.current);
          if (
            importableCells[0].value === '开始' &&
            Action_findNode('nodes.label', 'start-node', graphDataRef.current)
          )
            return message.info('开始块只能有一个');

          if (
            importableCells[0].value === '<span>结束</span>' &&
            Action_findNode('nodes.label', 'end-node', graphDataRef.current)
          )
            return message.info('结束块只能有一个');

          // if (importableCells[0].value === 'contain') {
          //   console.log('拖动的是容器');
          //   const tryCell = cloneDeep(importableCells[0]);
          //   const finalCell = cloneDeep(importableCells[0]);
          //   tryCell.value = 'try';
          //   finalCell.value = 'finally';
          //   tryCell.geometry.height = 100;
          //   finalCell.geometry.height = 100;
          //   importableCells.push(tryCell);
          //   importableCells.push(finalCell);
          // }

          if (importableCells.length > 0) {
            graph.stopEditing();

            // Holding alt while mouse is released ignores drop target
            const validDropTarget =
              target !== null && !mxEvent.isAltDown(evt)
                ? graph.isValidDropTarget(target, importableCells, evt) ||
                  isContainer(target)
                : false;
            let select = null;

            if (target !== null && !validDropTarget) {
              target = null;
            }

            if (!graph.isCellLocked(target || graph.getDefaultParent())) {
              graph.model.beginUpdate();
              try {
                x = Math.round(x);
                y = Math.round(y);

                // Splits the target edge or inserts into target group
                if (
                  allowSplit &&
                  graph.isSplitTarget(target, importableCells, evt)
                ) {
                  const s = graph.view.scale;
                  const tr = graph.view.translate;
                  const tx = (x + tr.x) * s;
                  const ty = (y + tr.y) * s;

                  const clones = graph.cloneCells(importableCells);
                  graph.splitEdge(
                    target,
                    clones,
                    null,
                    x - bounds.width / 2,
                    y - bounds.height / 2,
                    tx,
                    ty
                  );
                  select = clones;
                } else if (importableCells.length > 0) {
                  if (importableCells[0].value === '异常捕获') {
                    select = graph.importCells(importableCells, x, y, target);
                    const tryCells = cloneDeep(importableCells);
                    tryCells[0].value = '异常处理';
                    tryCells[0].geometry.height = 100;
                    const finalCells = cloneDeep(importableCells);
                    finalCells[0].value = '结束';
                    finalCells[0].geometry.height = 100;
                    select = select.concat(
                      graph.importCells(tryCells, x, y, target),
                      graph.importCells(finalCells, x, y, target)
                    );
                    console.log(select);
                  } else {
                    select = graph.importCells(importableCells, x, y, target);
                  }
                }

                // Executes parent layout hooks for position/order
                // 不存在graph.layoutManager这个属性
                // if (graph.layoutManager !== null) {
                //   const layout = graph.layoutManager.getLayout(target);

                //   if (layout !== null) {
                //     const s = graph.view.scale;
                //     const tr = graph.view.translate;
                //     const tx = (x + tr.x) * s;
                //     const ty = (y + tr.y) * s;

                //     for (let i = 0; i < select.length; i += 1) {
                //       layout.moveCell(select[i], tx, ty);
                //     }
                //   }
                // }

                if (
                  allowCellsInsertedValue &&
                  (evt == null || !mxEvent.isShiftDown(evt))
                ) {
                  graph.fireEvent(
                    new mxEventObject('cellsInserted', 'cells', select)
                  );
                }
              } catch (e) {
                // this.editorUi.handleError(e);
                console.log(e);
              } finally {
                graph.model.endUpdate();
                // if (!select) return;
                if (select.length !== 0) {
                  select.forEach((item, index) => {
                    console.log(graphDataMapRef);
                    item.id = getMxId(
                      graphDataRef.current,
                      graphDataMapRef.current
                    );
                    if (item.value.indexOf("class='compoent-content'") > -1) {
                      setGraphDataMap(item.id, {
                        shape: 'processblock',
                        properties: [
                          {
                            cnName: '标签名称',
                            enName: 'label',
                            value: item.value
                              .replace(
                                "<div class='compoent-content'><label class='component-icon'></label><span class='component-name' title='process'>",
                                ''
                              )
                              .replace('</span></div>', ''),

                            default: '',
                          },
                          {
                            cnName: '输入参数',
                            enName: 'param',
                            value: [],
                            default: '',
                          },
                          {
                            cnName: '流程块返回',
                            enName: 'output',
                            value: [],
                            default: '',
                          },
                        ],
                        variable: [],
                      });
                    } else if (
                      item.value.indexOf("class='rcomponent-content'") > -1
                    ) {
                      setGraphDataMap(item.id, {
                        shape: 'rhombus-node',
                        properties: [
                          {
                            cnName: '标签名称',
                            enName: 'label',
                            value: '判断',
                            default: '',
                          },
                          {
                            cnName: '分支条件',
                            enName: 'condition',
                            value: '',
                            default: '',
                            valueMapping: [
                              { name: '等于', value: '==' },
                              { name: '不等于', value: '!=' },
                              { name: '大于', value: '>' },
                              { name: '小于', value: '<' },
                              { name: '大于等于', value: '>=' },
                              { name: '小于等于', value: '<=' },
                              { name: '空', value: 'is None' },
                              { name: '非空', value: 'not None' },
                            ],
                            tag: 1,
                            valueList: [],
                          },
                        ],
                      });
                    } else if (item.value === '异常处理') {
                      item.geometry.x = 0;
                      item.geometry.y = 200;
                      item.style = item.style.replace('shadow=1;', '');
                      item.style += 'resizable=0';
                      select[0].insert(item);
                      // item.parent = select[0];
                    } else if (item.value === '结束') {
                      // item.parent = select[0];
                      item.geometry.x = 0;
                      item.geometry.y = 300;
                      item.style = item.style.replace('shadow=1;', '');
                      item.style += 'resizable=0';
                      select[0].insert(item);
                    } else if (
                      item.value.indexOf("class='group-content'") > -1
                    ) {
                      setGraphDataMap(item.id, {
                        shape: 'group',
                        properties: [
                          {
                            cnName: '标签名称',
                            enName: 'label',
                            value: 'for in',
                            defaule: '',
                          },
                          {
                            cnName: '循环类型',
                            enName: 'looptype',
                            value: '',
                            default: 'for_list',
                            valueMapping: [
                              { name: '遍历数组', value: 'for_list' },
                              { name: '遍历字典', value: 'for_dict' },
                              { name: '计次循环', value: 'for_times' },
                              { name: '条件循环', value: 'for_condition' },
                            ],
                          },
                          {
                            cnName: '循环条件',
                            enName: 'loopcondition',
                            value: '',
                            default: '',
                            tag: 1,
                            valueList: [],
                            valueMapping: [
                              { name: '等于', value: '==' },
                              { name: '不等于', value: '!=' },
                              { name: '大于', value: '>' },
                              { name: '小于', value: '<' },
                              { name: '大于等于', value: '>=' },
                              { name: '小于等于', value: '<=' },
                              { name: '空', value: 'is None' },
                              { name: '非空', value: 'not None' },
                            ],
                            for_list: [
                              {
                                id: 'listKeyword',
                                enName: 'value',
                                cnName: '值',
                                value: '',
                                default: '',
                                paramType: ['String'],
                              },
                              {
                                id: 'listArray',
                                enName: 'arrayRet',
                                cnName: '数组',
                                value: '',
                                default: '',
                                paramType: ['List'],
                              },
                            ],
                            for_dict: [
                              {
                                id: 'dictKey',
                                enName: 'key',
                                cnName: '键',
                                value: '',
                                default: '',
                                paramType: ['String'],
                              },
                              {
                                id: 'dictValue',
                                enName: 'value',
                                cnName: '值',
                                value: '',
                                default: '',
                                paramType: ['String'],
                              },
                              {
                                id: 'dictVar',
                                enName: 'dictVar',
                                cnName: '字典',
                                value: '',
                                default: '',
                                paramType: ['Dictionary'],
                              },
                            ],
                            for_times: [
                              {
                                id: 'timeIndex',
                                enName: 'index',
                                cnName: '索引名称',
                                value: '',
                                default: '',
                                paramType: ['String'],
                              },
                              {
                                id: 'timeStartIndex',
                                enName: 'startIndex',
                                cnName: '初始值',
                                value: '',
                                default: '',
                                paramType: ['String'],
                              },
                              {
                                id: 'timeEndIndex',
                                enName: 'endIndex',
                                cnName: '结束值',
                                value: '',
                                default: '',
                                paramType: ['String'],
                              },
                              {
                                id: 'timeStep',
                                enName: 'step',
                                cnName: '每次增加',
                                value: '',
                                default: '',
                                paramType: ['String'],
                              },
                            ],
                          },
                        ],
                      });
                    }
                  });
                }
                updateGraphDataAction(graph);
                graph.refresh();
                setTimeout(() => {
                  console.log(
                    '我看看',
                    graph,
                    graph.getSelectionCell(),
                    evt,
                    target,
                    x,
                    y,
                    force
                  );
                  let cell = graph.getSelectionCell();
                  let temp = undoAndRedoRef.current;

                  if (cell.value === '异常捕获') {
                    temp.undoSteps.pop();
                    temp.undoSteps.pop();
                    temp.undoSteps.pop();
                  } else {
                    temp.undoSteps.pop();
                  }

                  if (cell.parent)
                    temp.undoSteps.push(
                      // evt.properties.cells.map(cell => {
                      //   return {
                      [
                        {
                          // ---
                          type: 'cellsAdded',
                          counter: undoAndRedoRef.current.counter,
                          change: {
                            counter: undoAndRedoRef.current.counter,
                            vertex: cell.vertex,

                            // 恢复块所需要的数据
                            geometry: cell.geometry,
                            id: cell.id,
                            style: cell.style,
                            value: cell.value,

                            // 恢复线所需要的数据
                            source_id: cell.source ? cell.source.id : null,
                            target_id: cell.target ? cell.target.id : null,
                            value: cell.value,

                            // deepCopy一下当时的dataGraph

                            cell: cell,
                            value: cell.value,
                            style: cell.style,
                            parent: cell.parent
                              ? cell.parent
                              : getTempCellParent(),
                            parent_id: cell.parent
                              ? cell.parent.id
                              : getTempCellParent()
                              ? getTempCellParent().id
                              : '1', // getTempCellParent().id,
                            children: cell.children
                              ? [cell.children[0], cell.children[1]]
                              : null,
                            previous: null, //graphData.find()
                          },
                        },
                      ]
                      //})
                    );
                }, 0);

                undoAndRedoRef.current.counter += 1;

                changeCheckedGraphBlockId(select[0].id);
              }

              if (select !== null && select.length > 0) {
                graph.scrollCellToVisible(select[0]);
                graph.setSelectionCells(select);
              }

              if (
                graph.editAfterInsert &&
                evt !== null &&
                mxEvent.isMouseEvent(evt) &&
                select !== null &&
                select.length === 1
              ) {
                window.setTimeout(function () {
                  graph.startEditing(select[0]);
                }, 0);
              }
            }
          }

          mxEvent.consume(evt);
        }
      });
    };

    // 创建可拖拽的单元源，当拖拽结束时，生成对应的单元格
    const createItem = (
      cells,
      width,
      height,
      title,
      allowCellsInserted,
      elt
    ) => {
      const bounds = new MxRectangle(0, 0, width, height);
      if (cells.length > 1 || cells[0].vertex) {
        /* const ds =  */ createDragSource(
          elt,
          createDropHandler(cells, true, allowCellsInserted, bounds),
          // this.createDragPreview(width, height),
          null,
          cells,
          bounds
        );
        // addClickHandler(elt, ds, cells);
      }
    };

    useEffect(() => {
      // 工具栏
      // const toolDom = document.querySelector('.designergraph-container-header');
      // 输出面板
      const outputDom = document.querySelector(
        '.dragger-editor-container-output'
      );

      const rightDom = document.querySelector('.designergraph-parampanel');
      const rightWidth = localStorage.getItem('firstRight');
      const leftDom = document.querySelector('.designergraph-item');
      const leftWidth = localStorage.getItem('firstLeft');

      outputDom.style.width = `calc(100vw - ${rightDom.style.width} - ${leftDom.style.width})`;
      outputDom.style.left = leftDom.style.width;
      // console.log(toolDom);
    }, [conLeft]);

    return (
      <div className="designergraph editor">
        <GraphItem
          setShowLoadingLayer={setShowLoadingLayer}
          createItem={createItem}
        />
        <div id="graphContent">
          {isProcessNode ? (
            <MxGraphHeader
              // container={graphContainer.current}
              createItem={createItem}
              graphData={graphDataRef.current}
              graph={graph}
              conRight={conRight}
            />
          ) : null}
          <div className="dropContent">
            <div
              className="container-left"
              style={{ display: 'none' }}
              onClick={() => {
                const left = document.querySelector('.designergraph-item');
                left.style.display = '';
                left.style.width = '288px';
                localStorage.setItem('firstLeft', '288');
                document.querySelector('.container-left').style.display =
                  'none';
                setConLeft(n => n + 1);
                setConRight(n => n + 1);
              }}
            >
              <Icon type="double-right" />
            </div>
            <div
              className="container-right"
              style={{ display: 'none' }}
              onClick={() => {
                const right = document.querySelector(
                  '.designergraph-parampanel'
                );
                right.style.display = '';
                right.style.width = '288px';
                localStorage.setItem('firstRight', '288');
                document.querySelector('.container-right').style.display =
                  'none';
                setConLeft(n => n + 1);
                setConRight(n => n + 1);
              }}
            >
              <Icon type="double-left" />
            </div>
            <div
              className="graph-container"
              ref={graphContainer}
              id="graphContainer"
            />
          </div>
          <OutputPanel
            tag="graph"
            zoomIn={handleZoomIn}
            zoomOut={handleZoomOut}
            zoomLevel={zoomLevel}
            setZoomLevel={setZoomLevel}
            // zoomLevel={zoomLevel}
          />
        </div>

        <GraphParamPanel />
      </div>
    );
  }
);

export default MxgraphContainer;
