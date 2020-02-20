import { findNodeById } from './utils';

const canLink = () => {};

class EdgeHandler {
  constructor(propsAPI) {
    this.propsAPI = propsAPI;
  }

  handleEdgeChange = description => {
    if (description.action === 'add') {
      const graphData = this.propsAPI.save();
      const source = description.model.source;
      const target = description.model.target;
      const nodes = graphData.nodes;
      const edges = graphData.edges;
      // FIX ME: 添加判断何时应该删除该条连接线的逻辑
      // this.apiAction("undo");
      // console.log(nodes, edges, target, source);
    }
  };

  apiAction = command => {
    //console.log(command, this.propsAPI);
    setTimeout(() => {
      this.propsAPI.executeCommand(command);
    }, 0);
  };
}

export default EdgeHandler;