import React from 'react';
import { RegisterCommand, withPropsAPI } from 'gg-editor';
import {
  useInjectContext,
  InjectProvider,
} from 'react-hook-easier/lib/useInjectContext';

import { exportCustomProcessBlock } from '_utils/utils';

const path = require('path');
console.log(__dirname);
console.log(path.join(__dirname, '..', 'app'));
console.log(path.resolve(__dirname, '../utils'));
class CustomCommand extends React.Component {
  render() {
    const { propsAPI, history } = this.props;

    const config = {
      // 是否进入列队，默认为 true
      queue: false,

      // 命令是否可用
      enable(/* editor */) {
        return true;
      },

      // 正向命令逻辑
      execute(/* editor */) {
        console.log('执行了');
        exportCustomProcessBlock();
      },

      // 反向命令逻辑
      back(/* editor */) {
        console.log('执行反向命令');
      },

      // 快捷按键配置
      shortcutCodes: [['ctrlKey', 'j']],
    };

    return <RegisterCommand name="导出到本地" config={config} />;
  }
}

export default withPropsAPI(useInjectContext(CustomCommand));
