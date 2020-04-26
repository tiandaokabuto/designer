import React, { useRef } from 'react';
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
  let iitem = null;
  if (tabType !== 'atomic') {
    if (item.type === 'dir') {
      iitem = {
        ...item,
        type: ItemTypes.CARD,
        effectTag: 'new',
        $$typeof: item.$$typeof !== undefined ? item.$$typeof : 1,
        text: item.text !== undefined ? item.text : item.title.props.title,
        title: title,
        properties: [],
        // properties: [],
        graphDataMap: {},
      };
    } else {
      const { graphDataMap } = JSON.parse(
        fs.readFileSync(
          PATH_CONFIG(
            'project',
            `${currentProject}/${currentProject}_module/${item.title.props.title}.json`
          )
        )
      );
      iitem = {
        ...item,
        type: ItemTypes.CARD,
        effectTag: 'new',
        $$typeof: item.$$typeof !== undefined ? item.$$typeof : 1,
        text: item.text !== undefined ? item.text : item.title.props.title,
        title: title,
        properties: graphDataMap.properties,
        graphDataMap,
      };
    }
  } else {
    iitem = {
      ...item,
      type: ItemTypes.CARD,
      effectTag: 'new',
      $$typeof: item.$$typeof !== undefined ? item.$$typeof : 1,
      text: item.text !== undefined ? item.text : item.title.props.title,
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
    item: iitem,
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
