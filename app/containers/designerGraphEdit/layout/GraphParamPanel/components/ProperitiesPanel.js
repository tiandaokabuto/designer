import React from 'react';
import { Input } from 'antd';
import { useSelector } from 'react-redux';

export default () => {
  const checkedGraphBlockId = useSelector(
    state => state.grapheditor.checkedGraphBlockId
  );
  const graphDataMap = useSelector(state => state.grapheditor.graphDataMap);

  const properties = (graphDataMap.get(checkedGraphBlockId) || {}).properties;

  return (
    <div key={checkedGraphBlockId}>
      {(properties || []).map((param, index) => {
        return (
          <div key={index}>
            {param.cnName}
            <Input
              defaultValue={param.value}
              onChange={e => {
                param.value = e.target.value;
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
