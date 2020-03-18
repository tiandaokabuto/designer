import { useDrag } from 'react-dnd';
import cloneDeep from 'lodash/cloneDeep';

import useLockContextMenu from './useLockContextMenu';
import ItemTypes from '../statementTypes';

export default ({
  setIsDraggingNode,
  props,
  handleLoopStatementFlod,
  isFold,
  canDrag,
  id,
}) => {
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
    end(monitor) {
      setIsDraggingNode({});
      // 解锁
      /* eslint-disable */
      useLockContextMenu(false);
    },
  });
  return [drag, dragImage];
};
