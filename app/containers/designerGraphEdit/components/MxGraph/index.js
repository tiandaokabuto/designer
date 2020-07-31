/* eslint-disable no-new */
import React, { useRef, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useInjectContext } from 'react-hook-easier/lib/useInjectContext';
import X2JS from 'x2js';
// import { useSelector } from 'react-redux';

import mxgraph from './mxgraph';
import GraphItem from '../../layout/GraphItem';
import GraphParamPanel from '../../layout/GraphParamPanel';
import MxGraphHeader from './components/MxGraphHeader';
import OutputPanel from '../../../designerGraphBlock/layout/DragContainer/OutputPanel';
import { isDirNode, changeModifyState } from '../../../common/utils';
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
} from '../../../reduxActions';
import { setConnection, createPopupMenu } from './methods';
import useMxId from './methods/useMxId';
import {
  PROCESS_NODE,
  CONDITION_NODE,
  START_NODE,
  END_NODE,
} from './CellProperties';
import { POINT_POSITION_EXIT, POINT_POSITION_ENTRY } from './PointPosition';
import event from '../../../designerGraphBlock/layout/eventCenter';
import { updateGraphDataAction, deleteCellAction } from './mxgraphAction';

import './index.scss';

// liuqi
import {
  updateCurrentPagePosition,
  changeBlockTreeTab,
} from '../../../reduxActions';
import { Action_DeleteCell } from './actions/deleteCell';
import { Action_CopyCell, Action_PasteCell } from './actions/copyCell';
import { Action_findNode } from './actions/findNode';
import { translateToGraphData } from './actions/translateToGraphData';
import { Rule_checkConnection } from './rules/checkRules';
import { goHandleUndo, goHandleRedo } from './actions/undoAndRedo.js';
import { message } from 'antd';

const fs = require('fs');
const checkPng = require('./images/check.png');
let graph = null;
//let undoMng = null;

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
    // const [graph, setGraph] = useState(null);

    const [resetTag, setResetTag] = useState(false);

    const graphRef = useRef(null);

    const getMxId = useMxId();

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

      // 剪切板
      mxClipboard,
      // 撤销重做
      //mxUndoManager,
    } = mxgraph;

    const handleUndo = () => {
      goHandleUndo(graph, undoAndRedoRef.current, updateGraphDataAction);
    };

    const handleRedo = () => {
      goHandleRedo(graph, undoAndRedoRef.current, updateGraphDataAction);
    };

    useEffect(() => {
      const container = graphContainer.current;
      // setGraph(new mxGraph(container));
      graphRef.current = new mxGraph(container);
      graph = graphRef.current;
      event.addListener('resetGraph', resetGraph);

      //undoMng = new mxUndoManager();

      event.addListener('undo', handleUndo);
      event.addListener('redo', handleRedo);
      return () => {
        event.removeListener('undo', handleUndo);
        event.removeListener('redo', handleRedo);
        event.removeListener('resetGraph', resetGraph);
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
      //  启用画布平移
      graph.setPanning(true);
      // 开启右键菜单
      graph.popupMenuHandler.factoryMethod = function(menu, cell, evt) {
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

      graph.removeCells(graph.getChildVertices(graph.getDefaultParent()));

      loadGraph(graphDataRef.current);
      //undoMng.clear();
      // TODO: 清空撤销恢复池
      changeUndoAndRedo({
        // 第一层撤销重做
        undoSteps: [], // 可以用来重做的步骤
        redoSteps: [], // 可以用来
        counter: 0,
      });
    }, [currentCheckedTreeNodeRef.current, resetTag]);

    // 有坑
    const resetGraph = (value, id) => {
      console.log(graph);
      const cell = graph.getSelectionCell();
      // const cell = graph.getModel().getCell(id);
      graph.getModel().beginUpdate();
      try {
        if (cell.value.indexOf("class='compoent-content'") > -1) {
          cell.value = PROCESS_NODE.getLabel(value);
        } else if (cell.value.indexOf("class='rcomponent-content'") > -1) {
          cell.value = CONDITION_NODE.getLabel(value);
        }
      } finally {
        graph.getModel().endUpdate();
      }
      graph.refresh();
    };

    const configMxCell = () => {
      // 禁用双击编辑
      mxGraph.prototype.isCellEditable = function(cell) {
        //return !this.getModel().isEdge(cell)&&!this.getModel().isVertex(cell);
        return false;
      };

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
      mxGraph.prototype.isValidDropTarget = function(cell, cells, evt) {
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
      mxGraph.prototype.isPort = function(cell) {
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

          const colorKey = 'fillColor';
          const color = '#edf6f7';
          setTimeout(() => graph.setCellStyles(colorKey, color, [cell]), 0);
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
          const color = '#9ed4fb';
          setTimeout(() => graph.setCellStyles(colorKey, color, [cell]), 0);
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
      style[mxConstants.STYLE_EDGE] = mxEdgeStyle.ComponentEdge;
      style[mxConstants.STYLE_CURVED] = true;
      style[mxConstants.STYLE_FONTSIZE] = '28';
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
      // const listener = function (sender, evt) {
      //   undoMng.undoableEditHappened(evt.getProperty('edit'));
      // };
      // graph.getModel().addListener(mxEvent.UNDO, listener);
      // graph.getView().addListener(mxEvent.UNDO, listener);

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
      // 监听 - 键盘事件, 删除，复制，粘贴
      mxEvent.addListener(document, 'keydown', function(evt) {
        if (currentPagePositionRef.current === 'block') return;
        // 删除
        if (evt.key === 'Delete') {
          //message.info(`删除 键盘事件${evt.key}`, 1);
          const opt = {};
          Action_DeleteCell(graph, {
            deleteGraphDataMap,
            changeCheckedGraphBlockId,
          });
        }
      });

      mxEvent.addListener(document, 'keyup', evt => {
        // message.success({ content: `按键松了`, key: "keyboard", duration: 1 });
      });

      mxEvent.addListener(document, 'paste', function(evt) {
        if (currentPagePositionRef.current === 'block') return;

        if (evt.target.nodeName === 'PRE' || evt.target.nodeName === 'BODY') {
          //message.warning('粘贴');
          Action_PasteCell(graph, {
            mxClipboard,
            setGraphDataMap,
            changeCheckedGraphBlockId,
            graphData: graphDataRef.current,
            undoAndRedoRef
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

      mxEvent.addListener(document, 'copy', function(evt) {
        if (currentPagePositionRef.current === 'block') return;

        console.log(evt);

        if (evt.target.nodeName === 'PRE' || evt.target.nodeName === 'BODY') {
          //message.warning('复制');
          Action_CopyCell(graph, { mxClipboard, changeSavingModuleData });
        } else {
          return;
        }
      });

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
            setTimeout(()=>{
              graph.removeCells([evt.properties.edge]);
              undoAndRedoRef.current.undoSteps.pop();
              graph.refresh()
              updateGraphDataAction(graph);
            })

            return;
          }

          // TODO: 假如成功了，则同步更新到grapDataMap
          if (ans.rule === '判断') {
            //   `假如是判断块，要触发判断逻辑，把连线改成是否`,
            evt.properties.edge.setValue(ans.type);
          }
          console.clear();
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

      //

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
        const cell = evt.getProperty('cell');
        if (cell != null) {
          if (!cell.vertex) return;

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
            ['processblock', 'rhombus-node'].includes(data.shape)
          ) {
            changeCheckedGraphBlockId(cellId);
            synchroCodeBlock(graphDataMapRef.current.get(cellId));
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

      // 移动 CELLS_MOVED MOVE_CELLS
      graph.addListener(mxEvent.CELLS_MOVED, (sender, evt) => {
        updateGraphDataAction(graph);
        console.log('\n\n\n\n 更新啊啊啊啊啊啊 \n\n\n');

        // 要区别2种move，假如没有target，则是正常move
        // 有target，则是新增

        changeModifyState(
          processTreeRef.current,
          currentCheckedTreeNodeRef.current,
          true
        );

        let temp = undoAndRedoRef.current;

        //setTimeout(()=>{
        console.log(`【移动】纯移动`, sender, evt, undoAndRedoRef.current);
        temp.undoSteps.push(
          evt.properties.cells.map(cell => {
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
                  dx: cell ? evt.properties.dx : 'xxx',
                  dy: cell ? evt.properties.dy : 'xxx',
                },
              },
            };
          })
        );
        //},0)

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
        console.log('删除', sender, evt);

        let temp = undoAndRedoRef.current;
        temp.undoSteps.push(
          evt.properties.cells.map(cell => {
            return {
              type: 'remove',
              counter: undoAndRedoRef.current.counter,
              change: {
                counter: undoAndRedoRef.current.counter,
                vertex: cell.isVertex(),

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
              },
            };
          })
        );

        undoAndRedoRef.current.counter += 1;
        // updateGraphDataAction(graph);
        // changeModifyState(
        //   processTreeRef.current,
        //   currentCheckedTreeNodeRef.current,
        //   true
        // );
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
        const output = translateToGraphData(graph.getModel());
        if (output) {
          updateGraphData(output);
          synchroGraphDataToProcessTree();
        }
      });

      // graph.getModel().addListener(mxEvent.CHANGE, (sender, evt) => {
      // console.log('变动', sender);
      // console.log('graph model的改变');
      // console.clear();
      // console.log('MxGraph发生了变动', sender, evt);

      // const changes = evt.getProperty('edit').changes;
      // console.log(changes[0].constructor.name);

      // if (evt.properties.changes[0])
      // const codec = new MxCodec();
      // const node = codec.encode(sender);
      // const xml = mxUtils.getXml(node);

      // TODO: 将Mxgraph的结构转换成我们原来的GgEditor结构
      // const output = translateToGraphData(sender);
      // if (output) {
      //   updateGraphData(output);
      //   synchroGraphDataToProcessTree();
      // }
      // });
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
            obj._parent = '1';
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
            obj._parent = '1';
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
            obj._parent = '1';
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
            obj._parent = '1';
            obj._style = END_NODE.style;
            obj._value = END_NODE.label;
            obj._vertex = '1';
            obj.mxGeometry = {};
            obj.mxGeometry._x = String(item.x);
            obj.mxGeometry._y = String(item.y);
            obj.mxGeometry._width = String(END_NODE.width);
            obj.mxGeometry._height = String(END_NODE.height);
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
    };

    // const loadGraph = () => {
    //   // const xmlReq = mxUtils.load('D:/临时文件存放/fgh.xml');
    //   const xmlReq = mxUtils.load('D:/临时文件存放/fgh.xml');
    //   const root = xmlReq.getDocumentElement();
    //   const dec = new MxCodec(root);
    //   dec.decode(root, graph.getModel());
    // };

    const handleZoomIn = frequency => {
      for (let i = 0; i < frequency; i += 1) graph.zoomIn();
    };

    const handleZoomOut = frequency => {
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
      const funt = mxUtils.bind(this, function(...args) {
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

      dragSource.dragOver = function(...args) {
        mxDragSource.prototype.dragOver.apply(this, args);
      };

      // 仅当拖拽目标是一个合法根的时候可以拖进
      dragSource.getDropTarget = mxUtils.bind(this, function(graph, x, y, evt) {
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
      return mxUtils.bind(this, function(graph, evt, target, x, y, force) {
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
            Action_findNode('nodes.label', '开始', graphDataRef.current)
          )
            return message.info('开始块只能有一个');

          if (
            importableCells[0].value === '结束' &&
            Action_findNode('nodes.label', '结束', graphDataRef.current)
          )
            return message.info('结束块只能有一个');

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
                  select = graph.importCells(importableCells, x, y, target);
                }

                // Executes parent layout hooks for position/order
                if (graph.layoutManager !== null) {
                  const layout = graph.layoutManager.getLayout(target);

                  if (layout !== null) {
                    const s = graph.view.scale;
                    const tr = graph.view.translate;
                    const tx = (x + tr.x) * s;
                    const ty = (y + tr.y) * s;

                    for (let i = 0; i < select.length; i += 1) {
                      layout.moveCell(select[i], tx, ty);
                    }
                  }
                }

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
              } finally {
                graph.model.endUpdate();
                console.log('endUpdate, 开始修改id并设置graphDataMap');
                if (select[0]) {
                  // select[0].id = `mx_${uniqueId()}`;
                  select[0].id = getMxId(graphDataRef.current);
                  if (
                    select[0].value.indexOf("class='compoent-content'") > -1
                  ) {
                    setGraphDataMap(select[0].id, {
                      shape: 'processblock',
                      properties: [
                        {
                          cnName: '标签名称',
                          enName: 'label',
                          value: select[0].value
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
                    select[0].value.indexOf("class='rcomponent-content'") > -1
                  ) {
                    setGraphDataMap(select[0].id, {
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
                  }
                }
                console.log('修改结束');
                updateGraphDataAction(graph);

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
                  temp.undoSteps.push(
                    // evt.properties.cells.map(cell => {
                    //   return {
                    [
                      {
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

                          cell: cell,
                          // deepCopy一下当时的dataGraph
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
                window.setTimeout(function() {
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
            />
          ) : null}
          <div className="dropContent">
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
          />
        </div>

        <GraphParamPanel />
      </div>
    );
  }
);

export default MxgraphContainer;
