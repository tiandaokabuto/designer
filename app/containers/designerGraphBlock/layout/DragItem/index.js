import React, { useState } from 'react';
// import { useSelector } from 'react-redux';

import DragCard from './components/DragCard';
import {
  BasicStatementTag,
  LoopStatementTag,
  ConditionalStatementTag,
} from '../statementTags';

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
      ],
      optional: [],
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

  const [dragCard, setDragCard] = useState(initialState);
  return (
    <div className="dragger-editor-item">
      {dragCard.map((item, index) => (
        <DragCard item={item} />
      ))}
    </div>
  );
};
