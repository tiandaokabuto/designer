import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'antd';

import './index.scss';

const fs = require('fs');

export default function HelpModel({ visible, handleCancel }) {
  const [version, setVersion] = useState('');

  useEffect(() => {
    setVersion(getVerison());
  }, []);

  const getVerison = () => {
    const data = fs.readFileSync(`${process.cwd()}/version/version.json`, {
      encoding: 'utf-8',
    });
    const { version = '' } = JSON.parse(data);
    return version;
  };

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
            src="./containers/images/sdIcon.png"
            alt="流程易图标"
            className="help-model-title-icon"
          />
          <h1 className="help-model-title-cnTitle">流程易RPA设计器</h1>
          <h2 className="help-model-title-enTitle">SD-RPA</h2>
        </div>
        <div className="help-model-version">
          <Button className="help-model-version-test" onClick={getVerison}>
            检测版本
          </Button>
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
