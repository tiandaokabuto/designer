/**
 * 同步原子能力的数据结构
 */
import React, { Component } from 'react';
import { Icon, message } from 'antd';
import axios from 'axios';
import cloneDeep from 'lodash/cloneDeep';

import { traverseTree, getDecryptOrNormal } from '../../../../common/utils';
import { updateAutomicList } from '../../../../reduxActions';
import api from '../../../../../api';
import store from '../../../../../store';
import {
  readGlobalConfig as readConfig,
  writeGlobalConfig,
} from '../../../../../login/utils';
import event from '../../eventCenter';
import { encrypt } from '@/login/utils';

const fs = require('fs');

const currPath = process.cwd();

const DEFAULT_STYLE = {
  fontSize: '16px',
};

const generateIcon = (type, style = DEFAULT_STYLE) => (
  <Icon type={type} style={style} />
);

/**
 *
 * @param {*} list
 * @param {*} map
 */
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
    const parent = list.find(child => child.key === node.pKey);
    if (!parent) return;
    if (!parent.children) {
      parent.children = [node];
    } else {
      parent.children.push(node);
    }
  });
  return result;
};

/**
 *
 * @param {*} callback // 把数据写入到redux
 * @param {*} flag // false - 直接读本地文件 true - 从服务器获取数据
 */
const readGlobalConfig = (callback, flag = false) => {
  const path = `${currPath}/globalconfig/config.json`;
  fs.readFile(path, async function(err, data) {
    if (!err) {
      const { automicList, ip } = getDecryptOrNormal(data);
      if (flag || !automicList) {
        // 调起接口 返回数据
        const getAbialityStructure = (() => {
          return axios
            .get(api('selectCodeJson'))
            .then(res => {
              if (res && res.data) return res.data;
              throw res;
            })
            .then(res => {
              if (res && res.data) return res.data;
              throw res;
            })
            .catch(error => {
              throw error;
            });
        })();

        const getAbilityTree = (() => {
          return axios
            .get(api('selectMenuJson'))
            .then(res => {
              if (res && res.data) return res.data;
              throw res;
            })
            .then(res => {
              if (res && res.data) return res.data;
              throw res;
            })
            .catch(error => {
              throw error;
            });
        })();

        try {
          const abilityStructure = await getAbialityStructure;
          const abilityTree = await getAbilityTree;
          message.info('刷新成功');
          const resultTree = automicListToTree(abilityTree, abilityStructure); // 转换后的tree
          const prevPending = automicList
            ? automicList.filter(item =>
                ['favorite', 'recent'].includes(item.key)
              )
            : [];
          if (prevPending.length !== 0) {
            const favoriteChild = prevPending[0].children;
            const recentChild = prevPending[1].children;
            const deepResultTree = cloneDeep(resultTree);
            if (favoriteChild.length !== 0) {
              const newArr = favoriteChild.map(favoriteItem => {
                let newItem = null;
                traverseTree(deepResultTree, item => {
                  if (item.key === favoriteItem.key) {
                    newItem = item;
                  }
                });
                newItem.loved = true;
                return newItem;
              });
              prevPending[0].children = newArr;
            }
            if (recentChild.length !== 0) {
              const newArr = recentChild.map(recentItem => {
                let newItem = null;
                traverseTree(deepResultTree, item => {
                  if (item.key === recentItem.key) {
                    newItem = item;
                  }
                });
                newItem.loved = true;
                return newItem;
              });
              prevPending[1].children = newArr;
            }
          }
          const treeData = [
            ...(prevPending.length
              ? prevPending
              : [
                  {
                    pKey: null,
                    key: 'favorite',
                    title: '收藏',
                    children: [],
                    returnTreeData: null,
                  },
                  {
                    pKey: null,
                    key: 'recent',
                    title: '最近',
                    children: [],
                    returnTreeData: null,
                  },
                ]),

            {
              pKey: null,
              key: 'aviable',
              title: '可用',
              returnTreeData: null,
              children: resultTree,
            },
          ];

          writeGlobalConfig({
            automicList: treeData,
          });
          callback && callback(treeData);
        } catch (err) {
          console.log(err);
          message.info('刷新失败');
          // callback && callback([]);
        }
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
    event.addListener('update_list', this.handleUpdate);
    // 获取本地的数据结构做数据更新
    const {
      blockcode: { automicList },
    } = store.getState();
    if (!automicList.length) readGlobalConfig(this.updateAutomicList);
  }

  componentWillUnmount() {
    event.removeListener('update_list', this.handleUpdate);
  }

  handleUpdate = () => {
    readGlobalConfig(this.updateAutomicList, true);
  };

  updateAutomicList = treeData => {
    if (treeData.length > 0) updateAutomicList(treeData);
  };

  render() {
    return null;
  }
}
