import React, { useState, useRef } from 'react';
// import { Tree, Icon } from 'antd';
import { useDrag, useDrop } from 'react-dnd';
// import { useSelector } from 'react-redux';

import atomicCList from './atomicCList';
import DragCard from './components/DragCard';
import Tree from './components/CustomeTreeNode';
import {
  BasicStatementTag,
  LoopStatementTag,
  ConditionalStatementTag,
} from '../statementTags';

const { TreeNode } = Tree;

const initialState = [
  {
    $$typeof: BasicStatementTag,
    text: '启动chrome浏览器', // 代码的描述文字
    module: 'selenium',
    pkg: 'webdriver',
    cmdName: '启动新的浏览器',
    visible: '启动" chrome"浏览器，并将此浏览器作为控对象，赋值给hWeb',
    main: 'Chrome',
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
        },
        {
          cnName: '浏览器类型',
          enName: 'executable_path',
          value: "'C:\\chromedriver\\chromedriver.exe'",
          default: "'C:\\chromedriver\\chromedriver.exe'",
          desc: '属性说明',
          paramType: '参数类型：0:变量，',
          componentType: '组件类型:1：下拉框',
          valueMapping: [
            {
              name: '谷歌chrome浏览器',
              value: 'chrome',
            },
            {
              name: '火狐浏览器',
              value: 'fireFox',
            },
          ],
        },
      ],
      optional: [],
    },
  },
  {
    $$typeof: BasicStatementTag,
    text: '鼠标双击-截图',
    module: 'clickImage',
    pkg: 'MouseControl',
    cmdName: '鼠标双击-截图',
    visible: '查找图片在屏幕中的位置并双击',
    main: 'scshot_match',
    output: '',
    outputDesc: '没有输出',
    cmdDesc: '命令说明、描述',
    properties: {
      required: [
        {
          enName: 'ImagePath',
          cnName: '图片路径',
          desc: '图片路径',
          paramType: '参数类型：0:变量，',
          componentType: '组件类型:0：输入框',
          value: `"C:\\\\Users\\\\Administrator.SC-201902012149\\\\Desktop\\\\template.jpg"`,
          default: `"C:\\\\Users\\\\Administrator.SC-201902012149\\\\Desktop\\\\template.jpg"`,
        },
      ],
      optional: [
        {
          enName: '英文名称',
          cnName: '显示的名称',
          desc: '属性说明',
          paramType: '参数类型：0:变量，1：',
          componentType: '组件类型:0：输入框',
          default: '默认值',
        },
      ],
    },
  },
  {
    $$typeof: BasicStatementTag,
    text: '基本语句块2',
  },
  {
    $$typeof: LoopStatementTag,
    text: '循环控制语句',
  },
  {
    $$typeof: ConditionalStatementTag,
    text: '条件分支语句',
  },
];

export default () => {
  // const state = useSelector(state => state.dragItem);

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

  const [dragCard, setDragCard] = useState(initialState);
  console.log(TreeNode);
  return (
    <div className="dragger-editor-item">
      <div className="dragger-editor-item-title">组件库</div>
<<<<<<< HEAD
      {/* <Tree
        showLine={true}
        showIcon={true}
        className="dragger-editor-item-tree"
      >
        {renderTreeNodes(atomicCList)}
      </Tree> */}
      <Tree>{renderTreeNodes(atomicCList)}</Tree>
=======
>>>>>>> d4dc80a211d4db3f5db2ddcb6fa50363d626cefc
      {dragCard.map((item, index) => (
        <DragCard item={item} key={index} />
      ))}
    </div>
  );
};
