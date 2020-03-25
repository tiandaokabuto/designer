import React, { memo, Fragment } from 'react';
import { Input } from 'antd';

export default memo(({ checkedGridItemId, layout: { dataMap = {} } }) => {
  const gridItemDesc = dataMap[checkedGridItemId];
  if (!gridItemDesc) return null;
  return (
    <Fragment>
      <div>
        <span>标签</span>
        <Input />
      </div>
      <div>
        <span>变量</span>
        <Input />
      </div>
    </Fragment>
  );

  return <div>参数面板</div>;
});
