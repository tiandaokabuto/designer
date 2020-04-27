import React, { useRef, useMemo } from 'react';
import { Tooltip } from 'antd';
import { useDrag, useDrop } from 'react-dnd';
import ItemTypes from '../../statementTypes';

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
  const ref = useRef(null);
  const titleRef = useRef(null);
  let newItem = null;
  if (tabType !== 'atomic') {
    if (typeof title === 'string') {
      titleRef.current = title;
    }
    const { graphDataMap } = JSON.parse(
      fs.readFileSync(
        PATH_CONFIG(
          'project',
          `${currentProject}/${currentProject}_module/${titleRef.current}.json`
        )
      )
    );
    newItem = {
      ...item,
      type: ItemTypes.CARD,
      effectTag: 'new',
      $$typeof: 1,
      text: title,
      title: title,
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
    // item: {
    //   ...item,
    //   type: ItemTypes.CARD,
    //   effectTag: 'new',
    //   $$typeof: item.$$typeof !== undefined ? item.$$typeof : 1,
    //   text: item.text !== undefined ? item.text : item.title.props.title,
    // },
    item: newItem,
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      if (monitor.didDrop()) {
        console.log('放下了');
        console.log(item);
        if (tabType === 'atomic') {
          addToRecentList(node);
        }
        updateCheckedBlockId(monitor.getDropResult().newId);
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
