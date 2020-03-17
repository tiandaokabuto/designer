import React from 'react';
import { Modal, Icon, Button } from 'antd';

const Footer = ({ onCancelOk, onCancel, onOk }) => {
  return (
    <div>
      <Button onClick={onCancel}>取消</Button>
      <Button type="dashed" onClick={onCancelOk}>
        不保存
      </Button>
      <Button type="primary" onClick={onOk}>
        保存
      </Button>
    </div>
  );
};

export default ({
  visible,
  content = '请确认?',
  onOk,
  onCancel,
  onCancelOk,
}) => {
  return (
    <Modal
      width="30%"
      visible={visible}
      footer={
        <Footer onOk={onOk} onCancel={onCancel} onCancelOk={onCancelOk} />
      }
      closable={false}
      maskClosable={false}
    >
      <Icon
        type="question-circle"
        style={{
          color: '#faac13',
          fontSize: 24,
        }}
      />
      <span
        style={{
          verticalAlign: 'super',
          marginLeft: 12,
          userSelect: 'none',
        }}
      >
        {content}
      </span>
    </Modal>
  );
};
