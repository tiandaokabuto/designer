import React from 'react';
import { RegisterCommand, withPropsAPI } from 'gg-editor';
import {
  useInjectContext,
  InjectProvider,
} from 'react-hook-easier/lib/useInjectContext';

import { transformPythonWithPoint } from '@/containers/common/utils';

class RunFromHereCommand extends React.Component {
  render() {
    const { propsAPI, history } = this.props;

    const config = {
      // 是否进入列队，默认为 true
      queue: true,

      // 命令是否可用
      enable(/* editor */) {
        return true;
      },

      // 正向命令逻辑
      execute(/* editor */) {
        console.log('从此处执行');
        transformPythonWithPoint('from');
        console.log('执行正向命令');
      },

      // 反向命令逻辑
      back(/* editor */) {
        console.log('执行反向命令');
      },

      // 快捷按键配置
      shortcutCodes: [['ctrlKey', 'j']],
    };

    return <RegisterCommand name="从此处执行" config={config} />;
  }
}

export default withPropsAPI(useInjectContext(RunFromHereCommand));
