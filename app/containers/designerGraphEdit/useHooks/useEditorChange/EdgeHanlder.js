import { findNodeById } from './utils';
import {
  synchroGraphDataToProcessTree,
  updateGraphData,
} from '../../../reduxActions';

import { changeModifyState } from '../../../common/utils';
import store from '../../../../store';

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
    // 保存当前流程图的任意更新不加区分
    updateGraphData(this.propsAPI.save());
    synchroGraphDataToProcessTree();

    // 添加状态为未保存
    const {
      grapheditor: { processTree, currentCheckedTreeNode },
    } = store.getState();
    changeModifyState(processTree, currentCheckedTreeNode, true);
  };

  apiAction = command => {
    //console.log(command, this.propsAPI);
    setTimeout(() => {
      this.propsAPI.executeCommand(command);
    }, 0);
  };
}

export default EdgeHandler;
