import { findNodeById } from './utils';
import {
  synchroGraphDataToProcessTree,
  updateGraphData,
} from '../../../reduxActions';
import { message } from 'antd';

import { changeModifyState } from '../../../common/utils';
import store from '../../../../store';

const canLink = () => {};

class EdgeHandler {
  constructor(propsAPI) {
    this.propsAPI = propsAPI;
  }

  handleEdgeChange = (description) => {
    const { getSelected, executeCommand, update, save } = this.propsAPI;
    if (description.action === 'add') {
      // 连线操作
      const graphData = save();
      const { source } = description.model;
      const { dataMap } = description.item;
      const { nodes, edges } = graphData;
      const { shape } = dataMap[source];
      // 条件连线限制
      const rhombusNode = nodes.find(
        (item) => item.id === source && item.shape === 'rhombus-node'
      );
      if (rhombusNode) {
        const edgeChangeItem = description.item;
        const arr = edges.filter((item) => item.source === rhombusNode.id);
        if (arr.length === 1) {
          executeCommand(() => {
            update(edgeChangeItem, {
              label: '是',
            });
          });
        } else if (arr.length === 2) {
          if (arr[0].label === '是') {
            executeCommand(() => {
              update(edgeChangeItem, {
                label: '否',
              });
            });
          } else {
            executeCommand(() => {
              update(edgeChangeItem, {
                label: '是',
              });
            });
          }
        } else {
          this.apiAction('undo');
          message.info('判断节点输出连线不能多于两条');
        }
      } else if (shape === 'start-node' || shape === 'processblock') {
        // 开始、流程块节点连线限制
        const dataMapArray = Object.values(dataMap);
        const tipText = `${
          shape === 'start-node' ? '开始' : '流程块'
        }节点输出连线不能多于两条`;
        const edge = dataMapArray.filter((item) => item.source === source);
        if (edge.length > 1) {
          this.apiAction('undo');
          message.info(tipText);
        }
      }
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

  apiAction = (command) => {
    setTimeout(() => {
      this.propsAPI.executeCommand(command);
    }, 0);
  };
}

export default EdgeHandler;
