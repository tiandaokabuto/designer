import { mxPoint as MxPoint } from 'mxgraph-js';

import './Component.scss';

const component = (graph, commonData) => {
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
    const blockHtml = `<div class="component"><div class="compoent-content"><label class="component-icon"></label><span class="component-name" title="${name}">${name}</span></div></div>`;
    const blockWidth = 184;
    const blockHeight = 55;
    const blockStyle =
      'strokeWidth:none;html=1;strokeColor=none;overflow=fill;resizable=0;fillColor=none;';

    // 流程块连线节点配置参数
    const portHtml = '';
    const portWidth = 6;
    const portXPercent = 0.5;
    const portBasicYPercent = 0;
    const portHeight = 6;
    const portStyle = 'port;align=center;spacingRight=18;resizable=0;';
    const isPortPositionUsePercent = true;

    // 生成流程块主体
    const v1 = graph.insertVertex(
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
    let port = graph.insertVertex(
      v1,
      id,
      portHtml,
      portXPercent,
      portBasicYPercent,
      portWidth,
      portHeight,
      portStyle,
      isPortPositionUsePercent
    );
    // 连接点偏移
    port.geometry.offset = new MxPoint(-3, -3);
    // 自定义函数
    port.setPortIndex(0);
    port.setPortType('input');

    // 生成流程块主体下连接点
    port = graph.insertVertex(
      v1,
      id,
      portHtml,
      portXPercent,
      portBasicYPercent + 1,
      portWidth,
      portHeight,
      portStyle,
      isPortPositionUsePercent
    );
    port.geometry.offset = new MxPoint(-3, -3);
    port.setPortIndex(0);
    port.setPortType('output');
  } finally {
    model.endUpdate();
  }
};
export default component;
