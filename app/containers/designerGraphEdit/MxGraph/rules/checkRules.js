import { message } from "antd";

// 规则校验 - 连线
export const Rule_checkConnection = (graph, option = {}, callback) => {
  const { evt, graphData } = option;

  const edge = evt.getProperty("edge");
  const model = graph.getModel();
  const source = getNodeInfo(edge.source.id, graphData);
  const target = getNodeInfo(edge.target.id, graphData);

  console.log(source, target, `\n\n\n\n输入，输出\n\n\n`);

  // 01 开始点只能一条输出线
  if (source.shape === "start-node") {
    if (source.edges.output.length >= 1) {
      message.warning("开始节点只能有一条输出线");
      return false;
    }
  } else if (target.shape === "start-node") {
    message.warning("开始节点不能输入");
    return false;
  }

  // 02 流程块只能一个输出线，一个输入线
  if (source.shape === "processblock") {
    if (source.edges.output.length >= 1) {
      message.warning("流程块只能有一条输出线");
      return false;
    }
  }
  if (target.shape === "processblock") {
    if (target.edges.input.length >= 1) {
      message.warning("流程块只能有一条输入线");
      return false;
    }
  }

  // 03 结束只能输入，不限输入个数
  if (source.shape === "end-block") {
    message.warning("结束不能输出");
    return false;
  }

  // 04 判断只能出2条线，入一条
  if (source.shape === "rhombus-node") {
    console.log(source.edges.output)
    if (source.edges.output.length >= 2) {
      message.warning("判断块只能有最多2条输出线");
      return false;
    }
    if (source.edges.output.length === 0) {
      return { rule: "判断", type: "是" };
    }else if(source.edges.output[0].label === "否"){
      return { rule: "判断", type: "是" };
    }else{
      return { rule: "判断", type: "否" };
    }

  } else if (target.shape === "rhombus-node") {
    if (target.edges.input.length >= 1) {
      message.warning("判断块只能有一条输入线");
      return false;
    }
  }

  return { rule: "通过", type: "一般连线" };
};

function getNodeInfo(mxCell_mxObjectId, graphData) {
  const index = graphData.nodes.findIndex(
    (item) => item.id === mxCell_mxObjectId
  );
  let edges = {
    input: [], // 输入线
    output: [], // 输出线
  };
  graphData.edges.forEach((item) => {
    // 假如在target中检测到这个元素，则有一条输入线进入
    if (item.target === mxCell_mxObjectId) edges.input.push(item);
    // 假如在source中检测到这个元素，则有一条输入线进入
    if (item.source === mxCell_mxObjectId) edges.output.push(item);
  });
  // to
  if (index === -1) return false;
  return {
    shape: graphData.nodes[index].shape,
    edges: edges,
  };
}
