import React, { useMemo, memo } from 'react';
import { useSelector } from 'react-redux';
import { Input } from 'antd';

import './outputPanel.scss';

export default ({ output }) => {
  const graphDataMap = useSelector(state => state.grapheditor.graphDataMap);
  const checkedGraphBlockId = useSelector(
    state => state.grapheditor.checkedGraphBlockId
  );

  const returnList = graphDataMap
    .get(checkedGraphBlockId)
    .properties.find(item => item.enName === 'output').value;
  returnList.forEach((item, index) => {
    if (output[index] === undefined) {
      output.push({
        ...item,
        name: '',
      });
    } else {
      output[index].value = item.value;
    }
  });
  console.log(output, 'returnParams');
  return (
    <div className="outputPanel">
      <div className="outputPanel-container">
        <span>返回值</span>
        <span>描述</span>
      </div>
      {output.map((item, index) => (
        <div key={index} className="outputPanel-container">
          <Input
            key={item.name || '0'}
            defaultValue={item.name}
            onChange={e => (item.name = e.target.value)}
          />
          <span style={{ lineHeight: '32px' }}>{item.value}</span>
          {/* <Input
            key={item.value || '1'}
            defaultValue={item.value}

            onChange={e => (item.value = e.target.value)}
          /> */}
        </div>
      ))}
    </div>
  );
};
