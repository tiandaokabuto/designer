// 规则校验 - 连线
export function Rule_checkConnection(graph, option = {}, callback) {
  const { evt } = option;
  console.clear();
  console.log(`[校验开始]`, evt);

  const edge = evt.getProperty("edge");
  const model = graph.getModel();
  const source = edge.source.mxObjectId;
  //const sourcePortIndex = edge.source.getPortIndex();
  // const targetPortIndex = edge.target.getPortIndex();
  const target = edge.target.mxObjectId;

  // console.log(
  //   "显示 ",
  //   edge,
  //   model,
  //   source,
  //   target,"\n\n"
  //   // sourcePortIndex, targetPortIndex,
  // );
  console.log(`[源头]${source}     [目标]${target}`)
}
