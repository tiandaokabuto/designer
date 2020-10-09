import React, { useRef } from 'react';
import { Tooltip } from 'antd';
import { useDrag, useDrop } from 'react-dnd';
import { useDispatch, useSelector } from 'react-redux';
import ItemTypes from '../../constants/statementTypes';
import { CHANGE_CARDDATA } from '../../../../constants/actions/codeblock';
import { encrypt } from '@/login/utils';
import PATH_CONFIG from '@/constants/localFilePath';
import { getDecryptOrNormal } from '_utils/utils';

const fs = require('fs');

const transformText = (item, filter, node) => {
  let filterList = Array.isArray(node.filterList) ? node.filterList : [];
  return filterList.reduce(
    (prev, next) =>
      prev.replace(
        new RegExp(next, 'i'),
        match => `<span style="color: red;">${match}</span>`
      ),
    item.text
  );
};

export default ({
  item,
  node,
  title,
  tabType = 'atomic',
  currentProject = '',
  filter = '',
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
    if (typeof title === 'string') {
      titleRef.current = title;
    }
    const data = fs.readFileSync(
      PATH_CONFIG(
        'project',
        `${currentProject}/${currentProject}_module/${titleRef.current}_module.json`
      )
    );
    const { graphDataMap } = getDecryptOrNormal(data);
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
        updateCheckedBlockId([monitor.getDropResult().newId]);
      }
    },
  });
  drag(ref);
  return (
    <div ref={ref} className="dragger-editor-item-statement">
      {tabType === 'atomic' ? (
        <Tooltip
          placement="right"
          title={item.cmdDesc}
          overlayStyle={{ paddingLeft: '18px' }}
        >
          <span
            style={{ minWidth: 80, display: 'block' }}
            dangerouslySetInnerHTML={{
              __html: filter ? transformText(item, filter, node) : item.text,
            }}
          ></span>
        </Tooltip>
      ) : (
        item.title.props.title
      )}
    </div>
  );
};
