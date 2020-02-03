import axios from 'axios';

import api from '../api';

export const issueProcess = content => {
  const file = new File([content], 'upload.zip', { type: 'zip' });
  console.log(file);
  const formData = new FormData();
  formData.append('file', file);
  formData.append('processId', '12345678');
  formData.append('processName', '测试鼠标双击');
  formData.append('desc', '这是一个压缩后的zip包');
  formData.append('mainFile', 'test.py');
  axios
    .post(api.issueProcess, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then(res => res.data)
    .then(json => {
      console.log(json, '流程包上传成功');
    });
};
