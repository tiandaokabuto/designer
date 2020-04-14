import { message } from 'antd';
import uniqueId from 'lodash/uniqueId';

import { findNodeById, generateUniqueId } from './utils';
import {
  setGraphDataMap,
  updateGraphData,
  synchroGraphDataToProcessTree,
  changeSavingModuleData,
} from '../../../reduxActions';

import { changeModifyState } from '../../../common/utils';

import store from '../../../../store';

const canLink = () => {};

class NodeHandler {
  constructor(propsAPI) {
    this.propsAPI = propsAPI;
  }

  handleNodeChange = description => {
    if (description.action === 'add') {
      const {
        grapheditor: { savingModuleData, graphData },
      } = store.getState();
      if (description.model.shape === 'processblock') {
        const key = description.item.id;

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
        console.log(graphData, description);
        const model = description.model;
        const processBlockIdOne = generateUniqueId(graphData.nodes);
        const processBlockIdTwo = generateUniqueId(graphData.nodes);
        const processBlockIdThree = generateUniqueId(graphData.nodes);
        const processBlockIdFour = generateUniqueId(graphData.nodes);
        const rhombusNodeId = generateUniqueId(graphData.nodes);

        // group
        const LOOP_GRAPHDATA = {
          while: {
            nodes: [
              {
                style: { stroke: 'rgba(61, 109, 204, 1)', fill: '#ecf5f6' },
                x: model.x,
                y: model.y,
                label: '判断',
                id: rhombusNodeId, //'c67929f1',
                shape: 'rhombus-node',
                size: '184*56',
                type: 'node',
              },
              {
                style: { stroke: 'rgba(61, 109, 204, 1)', fill: '#ecf5f6' },
                x: model.x,
                y: model.y + 120,
                label: '流程块',
                id: processBlockIdOne,
                shape: 'processblock',
                size: '184*56',
                type: 'node',
              },
              {
                style: { stroke: 'rgba(61, 109, 204, 1)', fill: '#ecf5f6' },
                x: model.x,
                y: model.y + 240,
                label: '流程块',
                id: processBlockIdTwo,
                shape: 'processblock',
                size: '184*56',
                type: 'node',
              },
            ],
            edges: [
              {
                source: rhombusNodeId,
                target: processBlockIdOne,
                sourceAnchor: 1,
                targetAnchor: 0,
                label: '是',
              },
              {
                source: processBlockIdOne,
                target: rhombusNodeId,
                sourceAnchor: 3,
                targetAnchor: 3,
              },
              {
                source: rhombusNodeId,
                target: processBlockIdTwo,
                sourceAnchor: 2,
                targetAnchor: 2,
                label: '否',
              },
            ],
          },
          doWhile: {
            nodes: [
              {
                style: { stroke: 'rgba(61, 109, 204, 1)', fill: '#ecf5f6' },
                x: model.x,
                y: model.y + 120,
                label: '判断',
                id: rhombusNodeId, //'c67929f1',
                shape: 'rhombus-node',
                size: '184*56',
                type: 'node',
              },
              {
                style: { stroke: 'rgba(61, 109, 204, 1)', fill: '#ecf5f6' },
                x: model.x,
                y: model.y,
                label: '流程块',
                id: processBlockIdOne,
                shape: 'processblock',
                size: '184*56',
                type: 'node',
              },
              {
                style: { stroke: 'rgba(61, 109, 204, 1)', fill: '#ecf5f6' },
                x: model.x,
                y: model.y + 240,
                label: '流程块',
                id: processBlockIdTwo,
                shape: 'processblock',
                size: '184*56',
                type: 'node',
              },
            ],
            edges: [
              {
                source: rhombusNodeId,
                target: processBlockIdOne,
                sourceAnchor: 3,
                targetAnchor: 3,
                label: '是',
              },
              {
                source: processBlockIdOne,
                target: rhombusNodeId,
                sourceAnchor: 1,
                targetAnchor: 0,
              },
              {
                source: rhombusNodeId,
                target: processBlockIdTwo,
                sourceAnchor: 1,
                targetAnchor: 0,
                label: '否',
              },
            ],
          },
          forEach: {
            nodes: [
              {
                style: { stroke: 'rgba(61, 109, 204, 1)', fill: '#ecf5f6' },
                x: model.x,
                y: model.y + 120,
                label: '判断',
                id: rhombusNodeId, //'c67929f1',
                shape: 'rhombus-node',
                size: '184*56',
                type: 'node',
              },
              {
                style: { stroke: 'rgba(61, 109, 204, 1)', fill: '#ecf5f6' },
                x: model.x,
                y: model.y,
                label: '流程块',
                id: processBlockIdOne,
                shape: 'processblock',
                size: '184*56',
                type: 'node',
              },
              {
                style: { stroke: 'rgba(61, 109, 204, 1)', fill: '#ecf5f6' },
                x: model.x,
                y: model.y + 240,
                label: '流程块',
                id: processBlockIdTwo,
                shape: 'processblock',
                size: '184*56',
                type: 'node',
              },
              {
                style: { stroke: 'rgba(61, 109, 204, 1)', fill: '#ecf5f6' },
                x: model.x,
                y: model.y + 360,
                label: '流程块',
                id: processBlockIdThree,
                shape: 'processblock',
                size: '184*56',
                type: 'node',
              },
              {
                style: { stroke: 'rgba(61, 109, 204, 1)', fill: '#ecf5f6' },
                x: model.x - 100,
                y: model.y + 480,
                label: '流程块',
                id: processBlockIdFour,
                shape: 'processblock',
                size: '184*56',
                type: 'node',
              },
            ],
            edges: [
              {
                source: rhombusNodeId,
                target: processBlockIdOne,
                sourceAnchor: 1,
                targetAnchor: 0,
                label: '是',
              },
              {
                source: processBlockIdOne,
                target: rhombusNodeId,
                sourceAnchor: 3,
                targetAnchor: 3,
              },
              {
                source: rhombusNodeId,
                target: processBlockIdTwo,
                sourceAnchor: 2,
                targetAnchor: 2,
                label: '否',
              },
            ],
          },
        };

        updateGraphData({
          ...graphData,
          nodes: graphData.nodes.concat(LOOP_GRAPHDATA['forEach'].nodes),
          edges: graphData.edges.concat(LOOP_GRAPHDATA['forEach'].edges),
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
