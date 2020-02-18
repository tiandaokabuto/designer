import React from 'react';
import { Icon } from 'antd';

import Tree from './components/CustomeTreeNode';

const { TreeNode } = Tree;

const DEFAULT_STYLE = {
  fontSize: '16px',
};

const generateIcon = (type, style = DEFAULT_STYLE) => (
  <Icon type={type} style={style} />
);

const projectlist = [
  {
    title: '目录1',
    key: '0-0',
    icon: generateIcon('hdd'),
    children: [
      {
        description: 'openBrowser',
        key: '0-0-0',
        item: {
          text: '自定义文本流程一',
        },
        icon: generateIcon('branches'),
      },
      {
        description: 'openBrowser',
        key: '0-0-1',
        item: {
          text: '自定义文本流程二',
        },
        icon: generateIcon('branches'),
      },
    ],
  },
  {
    title: '目录2',
    key: '0-1',
    icon: generateIcon('hdd'),
    children: [],
  },
];
export default () => {
  const renderTreeNodes = data =>
    data.map(item => {
      if (item.children) {
        return (
          <TreeNode
            title={item.title}
            key={item.key}
            icon={item.icon}
            dataRef={item}
          >
            {renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode key={item.key} {...item} />;
    });
  return (
    <div className="designergraph-item">
      <div className="designergraph-item-title">我的项目</div>
      <Tree>{renderTreeNodes(projectlist)}</Tree>
    </div>
  );
};
