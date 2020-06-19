import React, { useRef } from 'react';
import { Select } from 'antd';

const { Option } = Select;

export default ({ desc, i }) => {
  const selectRef = useRef(null);
  return (
    <div className="interactive-handler" ref={selectRef} data-id={i}>
      <Select
        data-id={i}
        value={desc.label}
        onFocus={e => {
          selectRef.current.click();
        }}
      >
        <Option value="">暂无相关数据</Option>
      </Select>
    </div>
  );
};
