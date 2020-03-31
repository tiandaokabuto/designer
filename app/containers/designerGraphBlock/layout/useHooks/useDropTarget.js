import { useRef } from 'react';
import { useDrop } from 'react-dnd';
import uniqueId from 'lodash/uniqueId';

import ItemTypes, { PLACEHOLDER_STATEMENT, PREFIX_ID } from '../statementTypes';

const useDropTarget = ({
  setClassName,
  resetClassName,
  isDraggingNode,
  id,
  moveCard,
  addCard,
  index,
  props,
  className,
}) => {
  const ref = useRef(null);
  const [, drop] = useDrop({
    accept: ItemTypes.CARD,
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      const hoverIndex = index;

      if (item.effectTag === 'new') {
        if (hoverClientY < hoverMiddleY) {
          setClassName('cursor__before');
          resetClassName();
        } else {
          setClassName('cursor__after');
          resetClassName();
        }
        return;
      }

      const dragIndex = item.index;

      if (isDraggingNode.id === id) {
        return;
      }

      if (isDraggingNode.id !== item.id) return;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveCard(item, props.card);

      item.index = hoverIndex;
    },
    drop(item, monitor) {
      const newId = uniqueId(PREFIX_ID);
      if (!ref.current) {
        return;
      }
      if (item.effectTag === 'new') {
        addCard(
          index === PLACEHOLDER_STATEMENT
            ? index
            : className === 'cursor__before'
            ? index
            : index + 1,
          id,
          item,
          newId
        );
      }
      return { newId };
    },
  });

  return [ref, drop];
};

export default useDropTarget;
