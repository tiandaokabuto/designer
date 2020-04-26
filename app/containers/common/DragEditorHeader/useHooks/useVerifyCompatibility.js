import { message } from 'antd';

import store from '@/store';

export default () => {
  return () => {
    const {
      grapheditor: { currentCheckedTreeNode, processTree },
    } = store.getState();
    if (!currentCheckedTreeNode) {
      message.info('请选择流程进行校验');
      return;
    }
    console.log('hhhh', currentCheckedTreeNode, processTree);
  };
};
