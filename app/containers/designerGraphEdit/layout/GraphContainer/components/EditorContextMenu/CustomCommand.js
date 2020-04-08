import React from 'react';
import { RegisterCommand, withPropsAPI } from 'gg-editor';
import {
  useInjectContext,
  InjectProvider,
} from 'react-hook-easier/lib/useInjectContext';

class CustomCommand extends React.Component {
  render() {
    const { propsAPI, history } = this.props;

    const config = {
      // 是否进入列队，默认为 true
<<<<<<< HEAD
      queue: false,
=======
      queue: true,
>>>>>>> c12b5cb7384310eac5699896c48a508115e36022

      // 命令是否可用
      enable(/* editor */) {
        return true;
      },

      // 正向命令逻辑
      execute(/* editor */) {
        console.log('执行了');
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
