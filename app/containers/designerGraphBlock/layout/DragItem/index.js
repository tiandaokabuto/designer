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
    text: '基本语句块1',
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
