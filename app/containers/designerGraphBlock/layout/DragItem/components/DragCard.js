import React, { useRef } from 'react';
import { Tooltip } from 'antd';
import { useDrag, useDrop } from 'react-dnd';
import { useDispatch, useSelector } from 'react-redux';
import ItemTypes from '../../statementTypes';
import { CHANGE_CARDDATA } from '../../../../../actions/codeblock';
import { encrypt } from '@/login/utils';
import PATH_CONFIG from '@/constants/localFilePath';

const fs = require('fs');

export default ({
  item,
  node,
  title,
  tabType = 'atomic',
  currentProject = '',
  addToRecentList = () => {},
  updateCheckedBlockId = () => {},
}) => {
  const dispatch = useDispatch();
  const cards = useSelector(state => state.blockcode.cards);
  const cardsRef = useRef(null);
  cardsRef.current = cards;

  const ref = useRef(null);
  const titleRef = useRef(null);
  let newItem = null;

  if (tabType !== 'atomic') {
    console.log(typeof title);
    if (typeof title === 'string') {
      titleRef.current = title;
    }
    const data = fs.readFileSync(
      PATH_CONFIG(
        'project',
        `${currentProject}/${currentProject}_module/${titleRef.current}.json`
      )
    );
    const { graphDataMap } =
      data.toString().indexOf('{') === -1
        ? JSON.parse(encrypt.argDecryptByDES(data.toString()))
        : JSON.parse(data.toString());
    newItem = {
      ...item,
      type: ItemTypes.CARD,
      effectTag: 'new',
      $$typeof: 1,
      text: title,
      title,
      subtype: 9,
      properties: graphDataMap.properties,
      // properties: [],
      graphDataMap,
    };
  } else {
    newItem = {
      ...item,
      type: ItemTypes.CARD,
      effectTag: 'new',
      $$typeof: item.$$typeof,
      text: item.text,
    };
  }
  const [{ isDragging }, drag] = useDrag({
    item: newItem,
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      if (monitor.didDrop()) {
        dispatch({
          type: CHANGE_CARDDATA,
          payload: [...cardsRef.current],
        });
        if (tabType === 'atomic') {
          addToRecentList(node);
        }
        // updateCheckedBlockId(monitor.getDropResult().newId);
        updateCheckedBlockId([monitor.getDropResult().newId]);
      }
    },
  });
  drag(ref);
  return (
    <Tooltip placement="right" title={item.cmdDesc}>
      <div ref={ref} className="dragger-editor-item-statement">
        {/* {item.text} */}
        {tabType === 'atomic' ? item.text : item.title.props.title}
      </div>
    </Tooltip>
  );
};
