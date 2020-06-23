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

import './RComponent.scss';

export default class RComponent {
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
        `<div class="rcomponent">
          <div class="rcomponent-content">
            <label class="rcomponent-content-icon"></label>
            <span class="rcomponent-name" title="${name}">${name}</span>
          </div>
        </div>`,
        // name,
        commonData.left,
        commonData.top,
        100,
        100,
        'shape=rhombus;perimeter=ellipsePerimeter;resizable=0;'
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
        0.53,
        -0.03,
        6,
        6,
        'port;align=right;spacingRight=18;resizable=0;',
        true
      );
      port.geometry.offset = new mxPoint(-6, -3);
      port.setPortIndex(0);
      port.setPortType('input');
      port = this.graph.insertVertex(
        v1,
        null,
        '',
        0.53,
        1.03,
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
