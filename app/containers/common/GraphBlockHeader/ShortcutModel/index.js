import React, { useState, useEffect } from 'react';
import { Modal, Button, Table } from 'antd';
import './index.scss';

export default function ShortcutModel({ visible, handleCancel }) {
  const columns = [
    {
      title: '功能说明',
      dataIndex: 'description',
    },
    {
      title: '快捷键',
      dataIndex: 'shortcut',
    },
  ];
  const shortcutData = [
    {
      key: '1',
      description: '保存',
      shortcut: 'CTRL+S',
    },
    {
      key: '2',
      description: '运行',
      shortcut: 'F5',
    },
    {
      key: '3',
      description: '停止',
      shortcut: 'F12',
    },
    {
      key: '4',
      description: '撤销',
      shortcut: 'Ctrl+Z',
    },
    {
      key: '5',
      description: '恢复',
      shortcut: 'Ctrl+Y',
    },
    {
      key: '6',
      description: '复制',
      shortcut: 'Ctrl+C',
    },
    {
      key: '7',
      description: '粘贴',
      shortcut: 'Ctrl+V',
    },
    {
      key: '8',
      description: '剪切',
      shortcut: 'Ctrl+X',
    },
    {
      key: '9',
      description: '删除',
      shortcut: 'Delete',
    },
  ];
  return (
    <Modal
      title="快捷键说明"
      visible={visible}
      footer={null}
      onCancel={handleCancel}
      mask={false}
      bodyStyle={{
        padding: '0px 0px 30px 0px ',
        height: '400px',
      }}
      width={600}
    >
      <div className="shortcut-model">
        <Table
          columns={columns}
          dataSource={shortcutData}
          pagination={false}
          scroll={{ y: 350 }}
          size="middle"
        />
      </div>
    </Modal>
  );
}
