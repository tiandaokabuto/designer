import React from 'react';

import Command from './components/Command';

export default () => {
  return (
    <div className="designergraph-header">
      <div className="designergraph-header-container">
        <Command type="iconfileadd" title="新建" />
        <Command type="iconsave" title="保存" />
        <Command type="iconimport" title="导入" />
        <Command type="iconrecordlight" title="录制" />
        <Command type="iconzhihang" title="运行" />
        <Command type="icontingzhi" title="停止" />
        <Command type="iconwangyezhuaqu" title="数据抓取" />
      </div>
    </div>
  );
};
