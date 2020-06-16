import {
  mxGraph,
  mxParallelEdgeLayout,
  mxConstants,
  mxEdgeStyle,
  mxLayoutManager,
  mxCell,
  mxGeometry,
  mxRubberband,
  mxDragSource,
  mxKeyHandler,
  mxCodec,
  mxClient,
  mxConnectionHandler,
  mxUtils,
  mxToolbar,
  mxEvent,
  mxImage,
  mxFastOrganicLayout,
  mxStyleRegistry,
  mxPoint,
} from 'mxgraph-js';

export default class Component {
  constructor(graph, commomData, data) {
    this.graph = graph;
    this.commomData = commomData;
    this.data = data;
    this.render(commomData, data);
  }

  render(commonData, data) {
    if (commonData.nodeId == undefined) {
      return;
    }

    const nodeId = commonData.nodeId;
    const componentType = commonData.componentType;
    const name = commonData.name;
    const parent = this.graph.getDefaultParent();
    const model = this.graph.getModel();
    model.beginUpdate();
    try {
      var v1 = this.graph.insertVertex(
        parent,
        null,
        '<div class="component"><label class="component-icon"></label><span class="component-name" title="' +
          name +
          '">' +
          name +
          '</span><span class="status"></span></div>',
        commonData.left,
        commonData.top,
        180,
        30,
        'strokeWidth:none;html=1;strokeColor=none;overflow=fill;resizable=0;fillColor=none;'
      );
      v1.setConnectable(false);
      v1.setNodeType('functional');
      v1.setComponentType(componentType);
      v1.setNodeId(nodeId);
      v1.updateStatus(this.graph, commonData.node_status);
      var port = this.graph.insertVertex(
        v1,
        null,
        '',
        0.5,
        0,
        6,
        6,
        'port;align=right;spacingRight=18;resizable=0;',
        true
      );
      port.geometry.offset = new mxPoint(-6, -3);
      port.setPortIndex(0);
      port.setPortType('input');
      var port = this.graph.insertVertex(
        v1,
        null,
        '',
        0.5,
        1,
        6,
        6,
        'port;align=right;spacingRight=18;resizable=0;',
        true
      );
      port.geometry.offset = new mxPoint(-6, -3);
      port.setPortIndex(0);
      port.setPortType('output');
    } finally {
      model.endUpdate();
    }
  }
}
