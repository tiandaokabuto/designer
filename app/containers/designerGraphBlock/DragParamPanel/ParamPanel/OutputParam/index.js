import React, { useMemo, memo } from 'react';
import { useSelector } from 'react-redux';
import useForceUpdate from 'react-hook-easier/lib/useForceUpdate';
import { Input } from 'antd';
import { cloneDeep } from 'lodash';

import './index.scss';

export default ({ output, handleEmitCodeTransform, markBlockIsUpdated }) => {
  const [flag, forceUpdate] = useForceUpdate();
  const graphDataMap = useSelector(state => state.grapheditor.graphDataMap);
  const checkedGraphBlockId = useSelector(
    state => state.grapheditor.checkedGraphBlockId
  );

  const returnList = graphDataMap.get(checkedGraphBlockId)
    ? graphDataMap
        .get(checkedGraphBlockId)
        .properties.find(item => item.enName === 'output').value || []
    : [];
  returnList.forEach((item, index) => {
    if (output[index] === undefined) {
      output.push({
        ...item,
        name:""
      });
    } else {
      output[index].value = item.value;
      // output[index].name = item.name;
    }
  });

  output.length = returnList.length;
  // output = cloneDeep(returnList);

  return (
    <div className="outputPanel">
      <div className="outputPanel-container">
        <span>返回值</span>
        <span>描述</span>
      </div>
      {output.map((item, index) => (
        <div key={index} className="outputPanel-container">
          <Input
            // key={item.name || '0'}
            defaultValue={item.name}
            onChange={e => {
              item.name = e.target.value;
              markBlockIsUpdated();
              handleEmitCodeTransform();
            }}
          />
          <span style={{ lineHeight: '32px' }}>{item.value}</span>
        </div>
      ))}
    </div>
  );
};
