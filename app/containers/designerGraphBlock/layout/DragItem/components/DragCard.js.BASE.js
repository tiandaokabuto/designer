import React, { useRef } from 'react';
import { Tooltip } from 'antd';
import { useDrag, useDrop } from 'react-dnd';
import ItemTypes from '../../statementTypes';

export default ({ item, node, addToRecentList, updateCheckedBlockId }) => {
  const ref = useRef(null);
  const [{ isDragging }, drag] = useDrag({
    item: {
      ...item,
      type: ItemTypes.CARD,
      effectTag: 'new',
      $$typeof: item.$$typeof,
      text: item.text,
    },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      if (monitor.didDrop()) {
        addToRecentList(node);
        updateCheckedBlockId(monitor.getDropResult().newId);
      }
    },
  });
  drag(ref);
  return (
    <Tooltip placement="right" title={item.cmdDesc}>
      <div ref={ref} className="dragger-editor-item-statement">
        {item.text}
      </div>
    </Tooltip>
  );
};
