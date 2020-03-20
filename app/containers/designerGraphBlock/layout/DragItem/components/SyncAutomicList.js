/**
 * 同步原子能力的数据结构
 */
import React, { Component } from 'react';
import { Icon, message } from 'antd';
import axios from 'axios';

import { traverseTree } from '../../../../common/utils';
import { updateAutomicList } from '../../../../reduxActions';
import api from '../../../../../api';
import {
  readGlobalConfig as readConfig,
  writeGlobalConfig,
} from '../../../../../login/utils';
import event from '../../eventCenter';

const fs = require('fs');
const currPath = process.cwd();

const DEFAULT_STYLE = {
  fontSize: '16px',
};

const generateIcon = (type, style = DEFAULT_STYLE) => (
  <Icon type={type} style={style} />
);

const automicListToTree = (list = [], map) => {
  const result = [];
  list.forEach(node => {
    if (node.pKey === '-1') {
      node.icon = generateIcon('hdd');
      result.push(node);
      return;
    }
    node.icon = generateIcon('branches');
    node.item = map[node.item];
    let parent = list.find(child => child.key === node.pKey);
    if (!parent) return;
    if (!parent.children) {
      parent.children = [node];
    } else {
      parent.children.push(node);
    }
  });
  return result;
};

const readGlobalConfig = (callback, flag = false) => {
  const path = `${currPath}/globalconfig/config.json`;
  fs.readFile(path, async function(err, data) {
    if (!err) {
      const { automicList, ip } = JSON.parse(data.toString());
      if (flag || !automicList) {
        // 调起接口 返回数据 TODO...
        const getAbialityStructure = (() => {
          return axios.get(api('selectCodeJson')).then(res => res.data.data);
        })();

        const getAbilityTree = (() => {
          return axios.get(api('selectMenuJson')).then(res => res.data.data);
        })();

        try {
          const abilityStructure = await getAbialityStructure;
          const abilityTree = await getAbilityTree;
          message.info('刷新成功');
        } catch (err) {
          message.info('刷新失败');
        }

        const treeData = automicListToTree(abilityTree, abilityStructure);
        writeGlobalConfig({
          automicList: treeData,
        });
        callback && callback(treeData);
      } else {
        traverseTree(automicList, node => {
          if (node.pKey === -1) {
            node.icon = generateIcon('hdd');
          } else {
            node.icon = generateIcon('branches');
          }
        });
        callback && callback(automicList);
      }
    }
  });
};

export default class SyncAutomicList extends Component {
  componentDidMount() {
    // 获取本地的数据结构做数据更新
    readGlobalConfig(this.updateAutomicList);
    event.addListener('update_list', this.handleUpdate);
  }
  handleUpdate = () => {
    readGlobalConfig(this.updateAutomicList, true);
  };

  updateAutomicList = treeData => {
    updateAutomicList(treeData);
  };

  componentWillUnmount() {
    event.removeListener('update_list', this.handleUpdate);
  }

  render() {
    return null;
  }
}
