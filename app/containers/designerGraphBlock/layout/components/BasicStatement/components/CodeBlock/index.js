import React from 'react';
import { Modal } from 'antd';

export default ({ visible, setVisible }) => {
  return (
    <Modal
      visible={visible}
      onCancel={() => {
        setVisible(false);
      }}
      closable={false}
    >
      safdsf
    </Modal>
  );
};
