/* eslint-disable no-new */
import React, { useRef, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useInjectContext } from 'react-hook-easier/lib/useInjectContext';
import X2JS from 'x2js';
// import { useSelector } from 'react-redux';

import mxgraph from './mxgraph';
import MxGraphHeader from './components/MxGraphHeader';
import OutputPanel from '../../../designerGraphBlock/layout/DragContainer/OutputPanel';
// import useSaveAsXML from '../../../common/DragEditorHeader/useHooks/useSaveAsXML';
import {
  changeMxGraphData,
  setGraphDataMap,
  updateGraphData,
  synchroGraphDataToProcessTree,
} from '../../../reduxActions';
import { setConnection, createPopupMenu } from './methods';
import {
  PROCESS_NODE,
  CONDITION_NODE,
  START_NODE,
  END_NODE,
} from './CellProperties';
import { POINT_POSITION_EXIT, POINT_POSITION_ENTRY } from './PointPosition';

import './index.scss';

// liuqi
import {
  updateCurrentPagePosition,
  changeBlockTreeTab,
} from "../../../reduxActions";
import { Action_DeleteCell } from "./actions/deleteCell";
import { Action_CopyCell, Action_PasteCell } from "./actions/copyCell";
import { translateToGraphData } from "./actions/translateToGraphData";
import { Rule_checkConnection } from "./rules/checkRules";

import { message } from 'antd';

const fs = require('fs');
const checkPng = require('./images/check.png');

const x2js = new X2JS();

const MxgraphContainer = useInjectContext(({ updateGraphData, history }) => {
  // 流程图的信息
  const graphData = useSelector(state => state.grapheditor.graphData);

  // 每个流程快包含的信息
  const graphDataMap = useSelector(state => state.grapheditor.graphDataMap);
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

  // 流程树
  const processTree = useSelector(state => state.grapheditor.processTree);

  const graphContainer = useRef(null);
  const [graph, setGraph] = useState(null);

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

    // 剪切板
    mxClipboard,
  } = mxgraph;

  useEffect(() => {
    const container = graphContainer.current;
    setGraph(new mxGraph(container));
  }, []);

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
    mxVertexHandler.prototype.createCustomHandles = function () {
      const colorKey = 'fillColor';
      let color = '';
      let cells = graph.getSelectionCells();
      cells = cells.filter(cell => {
        // const style = graph.getCellStyle(cell);
        return cell.vertex && !graph.isSwimlane(cell);
      });
      if (cells.length > 0) {
        color = '#9ed4fb';
        graph.setCellStyles(colorKey, color, cells);
      }
      return null;
    };

    // 添加取消选中时处理函数
    mxSelectionCellsHandler.prototype.eventListeners = [
      'remove',
      (sender, evt) => {
        const { cell } = evt.properties.state;
        if (cell.vertex === false || graph.isSwimlane(cell)) return;
        const colorKey = 'fillColor';
        const color = '#edf6f7';
        graph.setCellStyles(colorKey, color, [cell]);
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

  // const [dealingPool, setDealingPool] = useState([]);
  // useEffect(()=>{
  //   let temp = dealingPool;
  //   const nextDeal = dealingPool.unshift();
  //   console.log(dealingPool)
  //   if(nextDeal.action === "记忆按键"){
  //     setKeyLock(true);
  //   }
  // },[dealingPool])

  const configEventHandle = () => {
    // 监听 - 键盘事件, 删除，复制，粘贴
    mxEvent.addListener(document, 'keydown', evt => {
      // 删除
      if (evt.key === 'Delete') {
        message.info(`删除 键盘事件${evt.key}`, 1);
        const opt = {};
        Action_DeleteCell(graph);
      }
    });

    mxEvent.addListener(document, 'keyup', evt => {
      // message.success({ content: `按键松了`, key: "keyboard", duration: 1 });
    });

    mxEvent.addListener(document, 'paste', function (evt) {
      message.warning('粘贴');
      Action_PasteCell(graph, { mxClipboard });
    });

    mxEvent.addListener(document, 'copy', evt => {
      message.warning('复制');
      Action_CopyCell(graph, { mxClipboard });
    });

    // 连线事件
    graph.addListener(mxEvent.CELL_CONNECTED, (sender, evt) => {
      message.info("校验连线");

      console.clear();
      console.log(sender, evt);
      if (!evt.getProperty("source")) {
        //const checkResult = Rule_checkConnection(graph, { evt });
        Rule_checkConnection(graph, { evt });
      } else {
        return false;
        //graph.removeCells([evt.properties.edge]);
      }
      // TODO 规则拦截判断
      //

      //graph.removeCells([evt.properties.edge]);
      return;
    });

    graph.isConnectable = ()=>{
      alert(666)
    };

    // 监听 - 双击事件
    graph.addListener(mxEvent.DOUBLE_CLICK, (sender, evt) => {
      const cell = evt.getProperty('cell');
      if (cell != null) {
        const overlays = graph.getCellOverlays(cell);

        if (cell.vertex) {
          updateCurrentPagePosition('block');
          // console.log(graphDataMapRef);
          // 将这个节点对应的card等等数据同步到全局
          // synchroCodeBlock(graphDataMapRef.current.get(node.item.id));
          // synchroCodeBlock({});

          // 假如是流程块，则进入
          //console.log(cell.vertex);
          // TODO：1， 检测当前选中的元素是否是流程快
          if (true);

          // TODO：2， Redux更新当前块并切换id

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
        const overlays = graph.getCellOverlays(cell);
        // 排除连接点和连接线
        const isPort = graph.isPort(cell);

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
          graph.addCellOverlay(cell, overlay);
        } else {
          graph.removeCellOverlays(cell);
        }
      }
    });

    graph.getModel().addListener(mxEvent.CHANGE, (sender, evt) => {
      //console.clear();
      console.log('MxGraph发生了变动', sender, evt);
      // const codec = new MxCodec();
      // const node = codec.encode(sender);
      // const xml = mxUtils.getXml(node);

      // TODO: 将Mxgraph的结构转换成我们原来的GgEditor结构
      const output = translateToGraphData(sender);
      console.log(output);
      if (output) {
        updateGraphData(output);
        synchroGraphDataToProcessTree();
        // 把graphData存入Redux
        //changeMxGraphData(output);
      }
    });
  };

  useEffect(() => {
    if (!graph) return;
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
      return createPopupMenu(graph, menu, cell, evt);
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
  }, [graph]);

  const parseJsonFile = () => {
    const jsonFile = fs.readFileSync('D:/临时文件存放/test.json');
    // 获得流程
    const graphData = jsonFile ? JSON.parse(jsonFile).graphData : {};

    const codec = new MxCodec();
    const node = codec.encode(graph.getModel());

    // const xml = mxUtils.getXml(node);

    // xml转换的json结构
    const json = x2js.dom2js(node);

    const nodes = graphData.nodes ? graphData.nodes : [];
    const edges = graphData.edges ? graphData.edges : [];

    console.log(edges);
    console.log(x2js.dom2js(node));

    const newNodes = nodes.map(item => {
      const obj = {};
      if (item.shape === 'processblock') {
        const labelStr = PROCESS_NODE.label;
        obj._id = item.id;
        obj._parent = '1';
        obj._style = PROCESS_NODE.style;
        obj._value = labelStr.replace('流程块', item.label);
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
        obj._value = CONDITION_NODE.label;
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

    const newEdges = edges.map(item => {
      const obj = {};
      let point = '';
      obj._id = item.id;
      obj._parent = '1';
      obj._edge = '1';
      obj._source = item.source;
      obj._target = item.target;
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
          point += POINT_POSITION_ENTRY.BOTTOM + POINT_POSITION_ENTRY.NORMAL;
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
      console.log(point);
      obj._style = point;
      return obj;
    });

    json.root.mxCell = json.root.mxCell.concat(newNodes).concat(newEdges);

    const newJson = {};
    newJson.mxGraphModel = {};
    newJson.mxGraphModel.root = json.root;

    const xml = x2js.js2xml(newJson);
    // const xml = mxUtils.getTextContent(div);

    console.log(xml);
    const xmlDoc = mxUtils.parseXml(xml);
    const codec02 = new MxCodec(xmlDoc);
    codec02.decode(xmlDoc.documentElement, graph.getModel());
  };

  const loadGraph = () => {
    // const xmlReq = mxUtils.load('D:/临时文件存放/fgh.xml');
    const xmlReq = mxUtils.load('D:/临时文件存放/fgh.xml');
    const root = xmlReq.getDocumentElement();
    const dec = new MxCodec(root);
    dec.decode(root, graph.getModel());
  };

  const handleZoomIn = frequency => {
    for (let i = 0; i < frequency; i += 1) graph.zoomIn();
  };

  const handleZoomOut = frequency => {
    for (let i = 0; i < frequency; i += 1) graph.zoomOut();
  };

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
      <OutputPanel tag="graph" zoomIn={handleZoomIn} zoomOut={handleZoomOut} />
    </div>
  );
});

export default MxgraphContainer;
