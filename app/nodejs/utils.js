import axios from 'axios';
import { message } from 'antd';
import store from '../store';

import { findNodeByKey } from '_utils/utils';
import api from '../api';

const { remote } = require('electron');

export const issueProcess = (content, descText, versionText, taskDataNames) => {
  const {
    grapheditor: { currentCheckedTreeNode, processTree },
  } = store.getState();

  if (!currentCheckedTreeNode) {
    message.error('未选择流程');
    return;
  }

  const node = findNodeByKey(processTree, currentCheckedTreeNode);
  if (!node) return;

  if (node.type !== 'process') {
    message.info('流程未保存');
    return;
  }

  const { token } = remote.getGlobal('sharedObject');

  const file = new File([content], 'upload.zip', { type: 'zip' });
  const formData = new FormData();
  formData.append('file', file);
  formData.append('processId', '12345678');
  formData.append('processName', node.title);
  formData.append('desc', descText);
  formData.append('mainFile', 'test.py');
  formData.append('version', versionText);
  formData.append('taskDataNames', taskDataNames);
  axios
    .post(api('issueProcess'), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'datae-token': token,
      },
    })
    .then(res => res.data)
    .then(json => {
      message.success('流程包发布成功');
      return json;
    })
    .catch(err => console.log(err));
};

export default issueProcess;
