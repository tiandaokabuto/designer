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
import event from '../../eventCenter';
import { encrypt, writeFileRecursive } from '../../../../../login/utils';

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
 * 根据参数从不同途径获取原子能力树
 * 1. 离线模式且没有原始的原子能力树，则从default.json文件中获取
 * 2. 如果flag为true或者没有原子能力树，则从服务器中获取
 * 3. 其他情况，从config.json中获取
 * @param {*} automicList 原子能力树
 * @param {*} callback 回调函数
 * @param {*} flag 是否从本地读取，false - 直接读本地文件 true - 从服务器获取数据
 * @param {*} offLine 是否离线状态
 */
const getAutomicList = async (automicList, callback, flag, offLine) => {
  const defaultPath = `${currPath}/globalconfig/default.json`;
  if (offLine && !automicList) {
    fs.readFile(defaultPath, (error, defaultData) => {
      if (!error) {
        const config = getDecryptOrNormal(defaultData);
        const defaultAutomicList = [
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
          config,
        ];
        traverseTree(defaultAutomicList, node => {
          if (node.pKey === -1) {
            node.icon = generateIcon('hdd');
          } else {
            node.icon = generateIcon('branches');
          }
        });
        writeGlobalConfig({
          automicList: defaultAutomicList,
        });
        callback && callback(defaultAutomicList);
      }
    });
  } else if (flag || !automicList) {
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
        ? automicList.filter(item => ['favorite', 'recent'].includes(item.key))
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
};

/**
 * 读取原子能力树，如果文件存在则读取，否则创建文件读取
 * @param {*} callback // 把数据写入到redux
 * @param {*} flag // false - 直接读本地文件 true - 从服务器获取数据
 */
const readGlobalConfig = (callback, flag = false) => {
  const path = `${currPath}/globalconfig/config.json`;
  const loginPath = `${currPath}/globalconfig/login.json`;
  fs.readFile(path, async (err, data) => {
    const offLine = await new Promise((resolve, reject) =>
      fs.readFile(loginPath, (error, loginData) => {
        if (!error) {
          resolve(getDecryptOrNormal(loginData).offLine);
        } else {
          reject(error);
        }
      })
    );
    if (!err) {
      let automicList = null;
      if (data.length > 0) automicList = getDecryptOrNormal(data).automicList;
      getAutomicList(automicList, callback, flag, offLine);
    } else {
      writeFileRecursive(path, '', error => {
        if (error) console.log(error);
        else getAutomicList(null, callback, flag, offLine);
      });
    }
  });
};

/**
 * 把原子能力树写入文件中
 * @param {*} content 新的原子能力树
 */
export const writeGlobalConfig = content => {
  const path = `${currPath}/globalconfig/config.json`;
  return new Promise((resolve, reject) =>
    fs.readFile(path, function(err, data) {
      if (!err) {
        fs.writeFile(
          path,
          encrypt.argEncryptByDES(JSON.stringify(content)),
          error => {
            if (error) {
              reject(error);
              throw error;
            } else {
              resolve();
            }
          }
        );
      }
    })
  );
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
