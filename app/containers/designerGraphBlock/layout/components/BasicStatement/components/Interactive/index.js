import React from 'react';
import { Modal } from 'antd';

import InteractiveControl from './components/InteractiveControl';

import './index.scss';

export default ({ visible, setVisible }) => {
  return (
    <Modal
      visible={visible}
      width="80%"
      bodyStyle={{
        height: '80vh',
      }}
      centered
      closable={false}
      maskClosable={false}
      onCancel={() => {
        setVisible(false);
      }}
    >
      <div className="interactive">
        <div className="interactive-item">
          <InteractiveControl item={{ type: 'input' }} />
        </div>
        <div className="interactive-container">
          <div className="interactive-container-layout"></div>
        </div>
      </div>
    </Modal>
  );
};
