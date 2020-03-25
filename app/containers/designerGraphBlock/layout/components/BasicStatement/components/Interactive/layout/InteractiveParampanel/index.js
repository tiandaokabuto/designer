import React, { memo, Fragment } from 'react';
import { Input } from 'antd';

export default memo(
  ({ handleLabelChange, checkedGridItemId, layout: { dataMap = {} } }) => {
    const gridItemDesc = dataMap[checkedGridItemId];
    if (!gridItemDesc) return null;

    return (
      <Fragment>
        <div>
          <span>标签</span>
          <Input
            value={gridItemDesc.label}
            onChange={e => {
              gridItemDesc.label = e.target.value;
              handleLabelChange();
            }}
          />
        </div>
        <div>
          <span>变量</span>
          <Input
            value={gridItemDesc.key}
            onChange={e => {
              gridItemDesc.key = e.target.value;
              handleLabelChange();
            }}
          />
        </div>
      </Fragment>
    );

    return <div>参数面板</div>;
  }
);
