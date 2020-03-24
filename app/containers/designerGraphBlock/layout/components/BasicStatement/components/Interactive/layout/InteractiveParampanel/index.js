import React, { memo } from 'react';

export default memo(({ checkedGridItemId, layout: { dataMap = {} } }) => {
  console.log(dataMap[checkedGridItemId]);
  console.log('hhhh11');
  return <div>参数面板</div>;
});
