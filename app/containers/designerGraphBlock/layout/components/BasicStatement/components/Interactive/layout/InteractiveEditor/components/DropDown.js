import React from 'react';
import { Select } from 'antd';

const { Option } = Select;

export default ({ desc, i }) => {
  return (
    <div className="interactive-handler" data-id={i}>
      <Select
        value={desc.label}
        onChange={value => {
          // handleLabelChange();
        }}
      >
        <Option value="">暂无相关数据</Option>
      </Select>
    </div>
  );
};
