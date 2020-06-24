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

import './Component.scss';

export default class Component {
  constructor(graph, commomData, data) {
    this.graph = graph;
    this.commomData = commomData;
    this.data = data;
    this.render(commomData, data);
  }

  render(commonData) {
    if (commonData.nodeId === undefined) {
      return;
    }

    const { nodeId, componentType, name } = commonData;
    const parent = this.graph.getDefaultParent();
    const model = this.graph.getModel();
    model.beginUpdate();
    try {
      const v1 = this.graph.insertVertex(
        parent,
        null,
        `<div class="component"><div class="compoent-content"><label class="component-icon"></label><span class="component-name" title="${name}">${name}</span></div></div>`,
        commonData.left,
        commonData.top,
        184,
        55,
        'strokeWidth:none;html=1;strokeColor=none;overflow=fill;resizable=0;fillColor=none;'
      );
      v1.setConnectable(false);
      v1.setNodeType('functional');
      v1.setComponentType(componentType);
      v1.setNodeId(nodeId);
      v1.updateStatus(this.graph, commonData.node_status);
      let port = this.graph.insertVertex(
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
      port.geometry.offset = new mxPoint(-3, -3);
      port.setPortIndex(0);
      port.setPortType('input');
      port = this.graph.insertVertex(
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
      port.geometry.offset = new mxPoint(-3, -3);
      port.setPortIndex(0);
      port.setPortType('output');
    } finally {
      model.endUpdate();
    }
  }
}
