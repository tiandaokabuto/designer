import React, { memo, Fragment } from 'react';
import { Input, Select } from 'antd';

const { Option } = Select;

const NAME_MAP = {
  label: '标签名称',
  key: '变量名',
  desc: '备注',
  value: '显示值',
  password: '密码类型',
  validRule: '校验规则',
  dataSource: '数据源',
};

export default memo(
  ({
    handleLabelChange,
    checkedGridItemId,
    handleLayoutColChange,
    layout: { dataMap = {}, cols },
  }) => {
    if (checkedGridItemId === 'layout') {
      return (
        <div className="parampanel-item">
          <span>列数设置</span>
          <Input
            value={cols}
            onChange={e => {
              handleLayoutColChange(e.target.value);
            }}
          />
        </div>
      );
    }
    const gridItemDesc = dataMap[checkedGridItemId];
    if (!gridItemDesc) return null;

    const getComponentType = (desc, item) => {
      switch (item) {
        case 'password':
          return (
            <Select
              value={desc[item]}
              onChange={value => {
                desc[item] = value;
                handleLabelChange();
              }}
              style={{
                flex: 1,
                marginLeft: 12,
              }}
            >
              <Option value="true">是</Option>
              <Option value="false">否</Option>
            </Select>
          );
        default:
          return (
            <Input
              value={desc[item]}
              onChange={e => {
                desc[item] = e.target.value;
                handleLabelChange();
              }}
            />
          );
      }
    };

    return (
      <Fragment>
        {Object.keys(gridItemDesc).map((item, index) => {
          if (!NAME_MAP[item]) return null;
          return (
            <div className="parampanel-item" key={index}>
              <span>{NAME_MAP[item]}</span>
              {getComponentType(gridItemDesc, item)}
            </div>
          );
        })}
      </Fragment>
    );
  }
);
