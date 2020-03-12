/**
 * 同步原子能力的数据结构
 */
import React, { Component } from 'react';
import { Icon } from 'antd';
import axios from 'axios';

import { updateAutomicList } from '../../../../reduxActions';
import api from '../../../../../api';

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
    if (node.pkey === '-1') {
      node.icon = generateIcon('hdd');
      result.push(node);
      return;
    }
    node.icon = generateIcon('branches');
    node.item = map[node.item];
    let parent = list.find(child => child.key === node.pkey);
    if (!parent) return;
    if (!parent.children) {
      parent.children = [node];
    } else {
      parent.children.push(node);
    }
  });
  return result;
};

const readGlobalConfig = callback => {
  const path = `${currPath}/globalconfig/config.json`;
  fs.readFile(path, async function(err, data) {
    if (!err) {
      const { automicList, ip } = JSON.parse(data.toString());
      // if (!automicList) return;
      // 调起接口 返回数据 TODO...
      const getAbialityStructure = (() => {
        return axios.get(api('selectCodeJson')).then(res => res.data.data);
      })();

      const getAbilityTree = (() => {
        return axios.get(api('selectMenuJson')).then(res => res.data.data);
      })();
      const abilityStructure = await getAbialityStructure;
      const abilityTree = await getAbilityTree;
      console.log(abilityStructure, abilityTree);

      const treeList = [
        {
          title: '邮件相关',
          pKey: null,
          key: '0',
        },
        {
          pKey: '0',
          key: '0-0',
          item: 'pkg_main',
        },
        {
          title: 'excel相关',
          pKey: null,
          key: '1',
        },
        {
          pKey: '1',
          key: '1-0',
          item: 'excel_main',
        },
      ];
      const description = {
        pkg_main: {
          $$typeof: 1,
          text: '启动新的浏览器',
          module: 'sendiRPA',
          pkg: 'Browser',
          cmdName: '启动新的浏览器',
          visible: '启动chrome浏览器，并将此浏览器作为控对象，赋值给{{outPut}}',
          visibleTemplate:
            '启动chrome浏览器，并将此浏览器作为控对象，赋值给{{outPut}}',
          main: 'openBrowser',
          output: 'hWeb',
          outputDesc: '输出说明：返回是否启动成功',
          cmdDesc: '命令说明、描述',
          properties: {
            required: [
              {
                cnName: '输出到',
                enName: 'outPut',
                value: 'hWeb',
                default: 'hWeb',
                componentType: 0,
              },
            ],
            optional: [
              {
                cnName: '浏览器类型',
                enName: 'driverPath',
                value: '"C:\\\\chromedriver\\\\chromedriver.exe"',
                default: '"C:\\\\chromedriver\\\\chromedriver.exe"',
                desc: '属性说明',
                paramType: '参数类型：0: 变量，',
                componentType: 1,
                //'组件类型: 1：下拉框',
                valueMapping: [
                  {
                    name: '谷歌chrome浏览器',
                    value: '"C:\\\\chromedriver\\\\chromedriver.exe"',
                  },
                  {
                    name: '火狐浏览器',
                    value: 'fireFox',
                  },
                ],
              },
            ],
          },
        },
        excel_main: {
          excel: '444',
        },
      };
      const treeData = automicListToTree(abilityTree, abilityStructure);

      console.log(treeData, 'hhhhhhh');

      callback && callback(treeData);
    }
  });
};

export default class SyncAutomicList extends Component {
  componentDidMount() {
    // 获取本地的数据结构做数据更新
    readGlobalConfig(this.updateAutomicList);
  }

  updateAutomicList = treeData => {
    updateAutomicList(treeData);
  };

  render() {
    return null;
  }
}
