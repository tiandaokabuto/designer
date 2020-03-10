import axios from 'axios';
import { message } from 'antd';
import store from '../store';

import { findNodeByKey } from '../containers/common/utils';
import api from '../api';

export const issueProcess = (content, descText) => {
  const {
    grapheditor: { currentCheckedTreeNode, processTree },
  } = store.getState();

  if (!currentCheckedTreeNode) {
    return;
  }

  const node = findNodeByKey(processTree, currentCheckedTreeNode);
  if (!node) return;

  if (node.type !== 'process') {
    message.info('流程未保存');
    return;
  }

  const file = new File([content], 'upload.zip', { type: 'zip' });
  const formData = new FormData();
  formData.append('file', file);
  formData.append('processId', '12345678');
  formData.append('processName', node.title);
  formData.append('desc', descText);
  formData.append('mainFile', 'test.py');
  axios
    .post(api('issueProcess'), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then(res => res.data)
    .then(json => {
      // message.success('发布成功');
      // console.log(json, '流程包上传成功');
      message.success('流程包发布成功');
    });
};
