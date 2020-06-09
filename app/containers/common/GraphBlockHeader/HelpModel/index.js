import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'antd';

import SdIcon from '@/containers/images/sdIcon.png';
import './index.scss';

/* const fs = require('fs'); */
// 涉及git的同步问题，每次更改后不会同步下来，pull下来的时候还是原始版本，改为手动更改
const version = '0.3.5.7';

export default function HelpModel({ visible, handleCancel }) {
  /* const [version, setVersion] = useState('');

  useEffect(() => {
    getVerison(setVersion);
  }, []);

  const getVerison = callBack => {
    fs.readFile(`${process.cwd()}/version/version.json`, function(err, data) {
      if (err) {
        console.log(err);
        callBack('');
      } else {
        const { version = '' } = JSON.parse(data.toString());
        callBack(version);
      }
    });
  }; */

  return (
    <Modal
      visible={visible}
      footer={null}
      onCancel={handleCancel}
      mask={false}
      wrapClassName="helpModel"
      width={480}
    >
      <div className="help-model">
        <div className="help-model-title">
          <img
            src={SdIcon}
            alt="流程易图标"
            className="help-model-title-icon"
          />
          <h1 className="help-model-title-cnTitle">流程易RPA设计器</h1>
          <h2 className="help-model-title-enTitle">SD-RPA</h2>
        </div>
        <div className="help-model-version">
          <Button className="help-model-version-test">检测版本</Button>
          <p className="help-model-version-text help-model-version-current">
            当前版本号：{version}
          </p>
          <p className="help-model-version-text help-model-version-copyright">
            版权所有 &copy; 广州市申迪计算机系统有限公司 保留所有权利
          </p>
        </div>
      </div>
    </Modal>
  );
}
