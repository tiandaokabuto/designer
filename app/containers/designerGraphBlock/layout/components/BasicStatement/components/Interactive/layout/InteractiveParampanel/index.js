import React, { memo, Fragment } from 'react';
import { Input } from 'antd';

const NAME_MAP = {
  label: '标签名称',
  key: '变量名',
  desc: '描述',
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

    return (
      <Fragment>
        {Object.keys(gridItemDesc).map((item, index) => {
          if (!NAME_MAP[item]) return null;
          return (
            <div className="parampanel-item" key={index}>
              <span>{NAME_MAP[item]}</span>
              <Input
                value={gridItemDesc[item]}
                onChange={e => {
                  gridItemDesc[item] = e.target.value;
                  handleLabelChange();
                }}
              />
            </div>
          );
        })}
      </Fragment>
    );
  }
);
