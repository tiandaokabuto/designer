import React, { useState, useEffect } from 'react';
import { Radio } from 'antd';

export default ({ param }) => {
  const [tag, setTag] = useState(1);

  useEffect(() => {
    if (!param.tag) {
      param.tag = 1;
      setTag(1);
    } else {
      setTag(param.tag);
    }
  }, []);

  const onChange = e => {
    setTag(e.target.value);
  };
  return (
    <React.Fragment>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Radio.Group>
          <Radio value={1}>选择模式</Radio>
          <Radio value={2}>拼接模式</Radio>
        </Radio.Group>
      </div>
    </React.Fragment>
  );
};
