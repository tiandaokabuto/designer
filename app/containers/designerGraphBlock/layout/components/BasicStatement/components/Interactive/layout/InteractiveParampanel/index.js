import React, { memo } from 'react';

export default memo(({ checkedGridItemId, layout: { dataMap = {} } }) => {
  console.log(dataMap[checkedGridItemId]);

  return <div>参数面板</div>;
});
