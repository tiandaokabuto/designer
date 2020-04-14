import { message } from 'antd';

import { findNodeById } from './utils';
import {
  setGraphDataMap,
  updateGraphData,
  synchroGraphDataToProcessTree,
  changeSavingModuleData,
} from '../../../reduxActions';

import { changeModifyState } from '../../../common/utils';

import store from '../../../../store';

// color: "#1890FF"
// id: "b8739d50"
// index: 1
// label: "流程块"
// shape: "processblock"
// size: "184*56"
// style: {stroke: "rgba(61, 109, 204, 1)", fill: "#ecf5f6"}
// type: "node"
// x: 360
// y: 125

const canLink = () => {};

class NodeHandler {
  constructor(propsAPI) {
    this.propsAPI = propsAPI;
  }

  handleNodeChange = description => {
    if (description.action === 'add') {
      if (description.model.shape === 'processblock') {
        const key = description.item.id;
        const {
          grapheditor: { savingModuleData },
        } = store.getState();
        if (savingModuleData) {
          setGraphDataMap(key, savingModuleData);
          changeSavingModuleData(undefined);
        } else {
          setGraphDataMap(key, {
            shape: 'processblock',
            properties: [
              {
                cnName: '标签名称',
                enName: 'label',
                value: '流程块',
                default: '',
              },
              {
                cnName: '输入参数',
                enName: 'param',
                value: [],
                default: '',
              },
              {
                cnName: '流程块返回',
                enName: 'output',
                value: '',
                default: '',
              },
            ],
            variable: [],
          });
        }
      } else if (description.model.shape === 'rhombus-node') {
        const key = description.item.id;
        setGraphDataMap(key, {
          shape: 'rhombus-node',
          properties: [
            {
              cnName: '标签名称',
              enName: 'label',
              value: '判断',
              default: '',
            },
            {
              cnName: '分支条件',
              enName: 'condition',
              value: '',
              default: '',
            },
          ],
        });
      } else if (description.model.shape === 'start-node') {
        const graphData = this.propsAPI.save();
        if (
          graphData.nodes.filter(node => node.shape === 'start-node').length > 1
        ) {
          message.info('只允许拖入一个开始结点');
          this.apiAction('undo');
          return;
        }
        const key = description.item.id;
        setGraphDataMap(key, {
          shape: 'start-node',
          properties: [],
        });
      } else if (description.model.shape === 'end-node') {
        const graphData = this.propsAPI.save();
        if (
          graphData.nodes.filter(node => node.shape === 'end-node').length > 1
        ) {
          message.info('只允许拖入一个结束结点');
          this.apiAction('undo');
          return;
        }
        const key = description.item.id;
        setGraphDataMap(key, {
          shape: 'end-node',
          properties: [],
        });
      } else if (description.model.shape === 'group') {
        this.apiAction('undo');
        const model = description.model;
        this.propsAPI.add('node', {
          style: { stroke: 'rgba(61, 109, 204, 1)', fill: '#ecf5f6' },
          x: model.x,
          y: model.y,
          label: '判断',
          id: 1,
          shape: 'rhombus-node',
          size: '184*56',
        });
        this.propsAPI.add('node', {
          style: { stroke: 'rgba(61, 109, 204, 1)', fill: '#ecf5f6' },
          x: model.x,
          y: model.y + 120,
          label: '流程块',
          id: 2,
          shape: 'processblock',
          size: '184*56',
        });
        // this.propsAPI.add('edge', {
        //   source: 1,
        //   target: 2,
        // });
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

  apiAction = command => {
    setTimeout(() => {
      this.propsAPI.executeCommand(command);
    }, 0);
  };
}

export default NodeHandler;
