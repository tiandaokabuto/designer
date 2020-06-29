import { mxPoint as MxPoint, mxCell, mxGeometry } from 'mxgraph-js';

import './GroupComponent.scss';

const defaultStyle = {
  title: '',
  fontSize: 12,
  fontColor: '#000000',
  titleHorizontalAlign: 'left',
  titleVerticalAlign: 'top',
  horizontalMargin: 10,
  verticalMargin: 10,
  bg: '#fcfcfc',
  borderStyle: 'solid',
  borderColor: '#dddddd',
  width: '300',
  height: '200',
  x: 180,
  y: 456,
};

const groundComponent = (graph, commonData) => {
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
    const blockHtml = `<div class="group-component"><div class="group-mask"><div class="group-title" id="remarkArea${nodeId}">容器</div></div></div>`;
    const blockWidth = 300;
    const blockHeight = 300;
    const blockStyle =
      'html=1;whiteSpace=wrap;container=1;recursiveResize=0;collapsible=0;';

    // 流程块连线节点配置参数
    const portHtml = '';
    const portWidth = 6;
    const portXPercent = 0.5;
    const portBasicYPercent = 0;
    const portHeight = 6;
    const portStyle = 'port;align=center;spacingRight=18;resizable=0;';
    const isPortPositionUsePercent = true;

    // 生成流程块主体
    /* const v1 = graph.insertVertex(
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
     */
    const v1 = new mxCell(
      'Label',
      new mxGeometry(0, 0, 160, 70),
      'html=1;whiteSpace=wrap;container=1;recursiveResize=0;collapsible=0;'
    );
    v1.vertex = true;
    /*
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

    // 生成子流程
    graph.insertVertex(v1, null, 'World!', 90, 20, 60, 20); */
    graph.addCells([v1]);
  } finally {
    model.endUpdate();
  }
};
export default groundComponent;
