import React, { useRef } from 'react';
import { Tooltip } from 'antd';
import { useDrag, useDrop } from 'react-dnd';
import { useDispatch, useSelector } from 'react-redux';
import ItemTypes from '../../statementTypes';
import { CHANGE_CARDDATA } from '../../../../../actions/codeblock';

export default ({ item, node, addToRecentList, updateCheckedBlockId }) => {
  const dispatch = useDispatch();
  const cards = useSelector(state => state.blockcode.cards);
  const cardsRef = useRef(null);
  cardsRef.current = cards;

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
        dispatch({
          type: CHANGE_CARDDATA,
          payload: [...cardsRef.current],
        });
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
