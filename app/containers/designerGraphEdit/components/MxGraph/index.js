/* eslint-disable no-new */
import React, { useRef, useEffect, useState } from 'react';
import { useInjectContext } from 'react-hook-easier/lib/useInjectContext';
import X2JS from 'x2js';
// import { useSelector } from 'react-redux';

import mxgraph from './mxgraph';
import MxGraphHeader from './components/MxGraphHeader';
import OutputPanel from '../../../designerGraphBlock/layout/DragContainer/OutputPanel';
// import useSaveAsXML from '../../../common/DragEditorHeader/useHooks/useSaveAsXML';
import { changeMxGraphData } from '../../../reduxActions';
import { setConnection, createPopupMenu } from './methods';
import { PROCESS_NODE, CONDITION_NODE } from './CellProperties';
import { POINT_POSITION } from './PointPosition';

import './index.scss';

const fs = require('fs');
const x2js = new X2JS();

const MxgraphContainer = useInjectContext(({ updateGraphData }) => {
  // const graphData = useSelector(state => state.grapheditor.graphData);
  // const graphDataMap = useSelector(state => state.grapheditor.graphDataMap);
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
  } = mxgraph;

  useEffect(() => {
    const container = graphContainer.current;
    setGraph(new mxGraph(container));
  }, []);

  const configMxCell = () => {
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

  const configEventHandle = () => {
    graph.addListener(mxEvent.CLICK, (sender, evt) => {
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
      }
    });
    graph.getModel().addListener(mxEvent.CHANGE, (sender, evt) => {
      console.log(sender);
      const codec = new MxCodec();
      const node = codec.encode(sender);
      const xml = mxUtils.getXml(node);
      changeMxGraphData(xml);
    });
  };

  useEffect(() => {
    if (!graph) return;
    graph.htmlLabels = true;

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

    loadGraph();

    parseJsonFile();
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
      console.log(item);
      const obj = {};
      if (item.shape === 'processblock') {
        const labelStr = PROCESS_NODE.label;
        obj._id = item.id;
        obj._parent = '1';
        obj._style = PROCESS_NODE.style;
        obj._value = labelStr.replace('流程快', item.label);
        obj._vertex = '1';
        obj.mxGeometry = {};
        obj.mxGeometry._x = String(item.x);
        obj.mxGeometry._y = String(item.y);
        obj.mxGeometry._width = String(PROCESS_NODE.width);
        obj.mxGeometry._height = String(PROCESS_NODE.height);
        obj.mxGeometry._as = 'geometry';
        obj.Array = [];
        obj.Array.push({
          _as: 'properties',
          Object: [
            {
              _cnName: '标签名称',
              _enName: 'label',
              _value: '流程块',
              _default: '',
            },
            {
              _cnName: '输入参数',
              _default: '',
              _enName: 'param',
              Array: [
                {
                  _as: 'value',
                },
              ],
            },
            {
              _cnName: '流程块返回',
              _default: '',
              _enName: 'output',
              Array: [
                {
                  _as: 'value',
                },
              ],
            },
          ],
        });
        obj.Array.push({
          _as: 'variable',
        });
        // obj.Array[0].Object = [];
        // obj.Array.push({
        //   _as: 'properties',
        //   Object: [
        //     {
        //       _cnName: '标签名称',
        //       _enName: 'label',
        //       _value: '判断',
        //       _default: '',
        //     },
        //     {
        //       _cnName: '输入参数',
        //       _default: '',
        //       _enName: 'param',
        //       Array: [
        //         {
        //           _as: 'value',
        //         },
        //       ],
        //     },
        //     {
        //       _cnName: '流程块返回',
        //       _default: '',
        //       _enName: 'output',
        //       Array: [
        //         {
        //           _as: 'value',
        //         },
        //       ],
        //     },
        //   ],
        // });
        // obj.Array[0].Object.push({
        //   _cnName: '标签名称',
        //   _enName: 'label',
        //   _value: '流程块',
        //   _default: '',
        // });
        // obj.Array[0].Object.push({
        //   _cnName: '输入参数',
        //   _default: '',
        //   _enName: 'param',
        //   Array: [
        //     {
        //       _as: 'value',
        //     },
        //   ],
        // });
        // obj.Array[0].Object.push({
        //   _cnName: '流程块返回',
        //   _default: '',
        //   _enName: 'output',
        //   Array: [
        //     {
        //       _as: 'value',
        //     },
        //   ],
        // });
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
        obj.Array = [];
        obj.Array.push({
          _as: 'properties',
          Object: [
            {
              _cnName: '标签名称',
              _enName: 'label',
              _value: '判断',
              _default: '',
            },
            {
              _cnName: '分支条件',
              _enName: 'condition',
              _value: '',
              _default: '',
              _tag: 1,
              Array: [
                {
                  _as: 'valueMapping',
                  Object: [
                    { _name: '等于', _value: '==' },
                    { _name: '不等于', _value: '!=' },
                    { _name: '大于', _value: '>' },
                    { _name: '小于', _value: '<' },
                    { _name: '大于等于', _value: '>=' },
                    { _name: '小于等于', _value: '<=' },
                    { _name: '空', _value: 'is None' },
                    { _name: '非空', _value: 'not None' },
                  ],
                },
                {
                  _as: 'valueList',
                },
              ],
            },
          ],
        });
      }
      return obj;
    });

    json.root.mxCell = json.root.mxCell.concat(newNodes);

    const newJson = {};
    newJson.mxGraphModel = {};
    newJson.mxGraphModel.root = json.root;

    const xml = x2js.js2xml(newJson);

    console.log(xml);
  };

  const loadGraph = () => {
    // const xmlReq = mxUtils.load('D:/临时文件存放/fgh.xml');
    const xmlReq2 = mxUtils.load('D:/临时文件存放/fgh.xml');
    const root = xmlReq2.getDocumentElement();
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
