import { useRef } from 'react';
import { useDrag } from 'react-dnd';
import cloneDeep from 'lodash/cloneDeep';
import { useDispatch, useSelector } from 'react-redux';

import useLockContextMenu from './useLockContextMenu';
import ItemTypes from '../statementTypes';
import { CHANGE_CARDDATA } from '../../../constants/actions/codeblock';

export default ({
  setIsDraggingNode,
  props,
  handleLoopStatementFlod,
  isFold,
  canDrag,
  id,
}) => {
  const dispatch = useDispatch();
  const cards = useSelector(state => state.blockcode.cards);
  const cardsRef = useRef(null);
  cardsRef.current = cards;

  const [, drag, dragImage] = useDrag({
    item: { type: ItemTypes.CARD, ...cloneDeep(props.card) },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: () => {
      return canDrag;
    },
    begin(monitor) {
      /**
       * 循环语句前置处理
       */
      // if (handleLoopStatementFlod) {
      //   if (!isFold) {
      //     handleLoopStatementFlod();
      //   }
      // }
      setIsDraggingNode(props);
      // 加锁
      /* eslint-disable */
      useLockContextMenu(true);
    },
    end(item, monitor) {
      setIsDraggingNode({});
      dispatch({
        type: CHANGE_CARDDATA,
        payload: [...cardsRef.current],
      });
      // 解锁
      /* eslint-disable */
      useLockContextMenu(false);
    },
  });
  return [drag, dragImage];
};
