import { mxPoint } from 'mxgraph-js';

import './ConditionalComponent.scss';

const conditionalComponent = (graph, commonData) => {
  if (commonData.nodeId === undefined) {
    return;
  }
  const { nodeId, componentType, name } = commonData;
  const parent = graph.getDefaultParent();
  const model = graph.getModel();
  model.beginUpdate();

  try {
    const id = null;
    // 流程块配置参数
    const blockHtml = `<div class="rcomponent">
    <div class="rcomponent-content">
      <label class="rcomponent-content-icon"></label>
      <span class="rcomponent-name" title="${name}">${name}</span>
    </div>
  </div>`;
    const blockWidth = 100;
    const blockHeight = 150;
    const blockStyle = 'shape=rhombus;perimeter=ellipsePerimeter;resizable=0;';

    // 流程块连线节点配置参数
    const portHtml = '';
    const portWidth = 6;
    const portHeight = 6;
    const portXPercent = 0.53;
    const portYPercent = -0.03;
    const portStyle = 'port;align=right;spacingRight=18;resizable=0;';
    const isPortPositionUsePercent = true;

    const v1 = this.graph.insertVertex(
      parent,
      id,
      blockHtml,
      commonData.left,
      commonData.top,
      blockWidth,
      blockHeight,
      blockStyle
    );

    // 流程块主体通过连接点连接，而不是把整个流程块主体看成一个连接点
    v1.setConnectable(false);
    // 自定义函数
    v1.setNodeType('functional');
    v1.setComponentType(componentType);
    v1.setNodeId(nodeId);
    v1.updateStatus(graph, commonData.node_status);

    // 生成流程块主体上连接点
    let port = this.graph.insertVertex(
      v1,
      id,
      portHtml,
      portXPercent,
      portYPercent,
      portWidth,
      portHeight,
      portStyle,
      isPortPositionUsePercent
    );
    port.geometry.offset = new mxPoint(-6, -3);
    port.setPortIndex(0);
    port.setPortType('output');

    port = this.graph.insertVertex(
      v1,
      id,
      portHtml,
      portXPercent,
      1.03,
      portWidth,
      portHeight,
      portStyle,
      isPortPositionUsePercent
    );
    port.geometry.offset = new mxPoint(-6, -3);
    port.setPortIndex(0);
    port.setPortType('input');
  } finally {
    model.endUpdate();
  }
};

export default conditionalComponent;

// class RComponent {
//   constructor(graph, commomData, data) {
//     this.graph = graph;
//     this.commomData = commomData;
//     this.data = data;
//     this.render(commomData, data);
//   }

//   render(commonData) {
//     if (commonData.nodeId === undefined) {
//       return;
//     }

//     const { nodeId, componentType, name } = commonData;
//     const parent = this.graph.getDefaultParent();
//     const model = this.graph.getModel();
//     model.beginUpdate();
//     try {
//       const v1 = this.graph.insertVertex(
//         parent,
//         null,
//         `<div class="rcomponent">
//           <div class="rcomponent-content">
//             <label class="rcomponent-content-icon"></label>
//             <span class="rcomponent-name" title="${name}">${name}</span>
//           </div>
//         </div>`,
//         // name,
//         commonData.left,
//         commonData.top,
//         100,
//         100,
//         'shape=rhombus;perimeter=ellipsePerimeter;resizable=0;'
//       );
//       v1.setConnectable(false);
//       v1.setNodeType('functional');
//       v1.setComponentType(componentType);
//       v1.setNodeId(nodeId);
//       v1.updateStatus(this.graph, commonData.node_status);

//       let port = this.graph.insertVertex(
//         v1,
//         null,
//         '',
//         0.53,
//         -0.03,
//         6,
//         6,
//         'port;align=right;spacingRight=18;resizable=0;',
//         true
//       );
//       port.geometry.offset = new mxPoint(-6, -3);
//       port.setPortIndex(0);
//       port.setPortType('input');
//       port = this.graph.insertVertex(
//         v1,
//         null,
//         '',
//         0.53,
//         1.03,
//         6,
//         6,
//         'port;align=right;spacingRight=18;resizable=0;',
//         true
//       );
//       port.geometry.offset = new mxPoint(-6, -3);
//       port.setPortIndex(0);
//       port.setPortType('output');
//     } finally {
//       model.endUpdate();
//     }
//   }
// }
