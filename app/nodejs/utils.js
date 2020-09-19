import axios from 'axios';
import { message } from 'antd';
import store from '../store';

import PATH_CONFIG from '../constants/localFilePath';
import { findNodeByKey } from '_utils/utils';
import useGetProcessName from '../containers/common/DragEditorHeader/useHooks/useGetProcessName';
import { readDir } from './index';
import api from '../api';

const { remote } = require('electron');
const process = require('process');
// const fs = require('fs')
const JSZIP = require('jszip');
const zip = new JSZIP();

export const issueProcess = (
  content,
  descText,
  versionText,
  taskDataNamesData,
  variableNamesData
) => {
  const {
    grapheditor: { currentCheckedTreeNode, processTree, currentProject },
  } = store.getState();

  const getProcessName = useGetProcessName();

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
  formData.append('taskDataNames', taskDataNamesData);
  formData.append('variableNames', variableNamesData);
  return axios
    .post(api('issueProcess'), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'datae-token': token,
      },
    })
    .then(res => res.data)
    .then(json => {
      console.log(json);
      if (json.code === 0) {
        issueFlowChart(currentProject, getProcessName(), versionText, token);
      }

      return json;
    })
    .catch(err => console.log(err));
};

export const issueFlowChart = (
  projectName,
  processName,
  versionText,
  token
) => {
  const targetDir = `${process.cwd()}/project/${projectName}/${processName}`;
  readDir(zip, targetDir);
  zip
    .generateAsync({
      // 设置压缩格式，开始打包
      type: 'nodebuffer', // nodejs用
      compression: 'DEFLATE', // 压缩算法
      compressionOptions: {
        // 压缩级别
        level: 9,
      },
    })
    .then(function (content) {
      // fs.writeFileSync(`${process.cwd()}/project/aaa.zip`, conte)
      const file = new File([content], `${processName}.zip`, { type: 'zip' });
      const formData = new FormData();
      formData.append('file', file);
      formData.append('version', versionText);
      formData.append('processName', processName);
      axios
        .post(api('issueFlowChart'), formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'datae-token': token,
          },
        })
        .then(res => res.data)
        .then(json => {
          if (json.code === 0) {
            message.success(json.message);
          } else {
            message.error(json.message);
          }
          console.log(json);
        })
        .catch(e => console.log(e));
    });
};

export default issueProcess;
