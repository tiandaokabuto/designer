import React, { useState, useMemo } from 'react';
import { Modal, Form, Input, Table } from 'antd';

import { newProject, readAllFileName } from '../../utils';

const FormItem = Form.Item;
const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 },
};

export default ({ resetVisible }) => {
  const [visible, setVisible] = useState(true);
  const [projectName, setProjectName] = useState('');
  const fileList = useMemo(() => {
    return readAllFileName();
  }, []);

  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
    },
    {
      title: '创建时间',
      dataIndex: 'birthtime',
    },
    {
      title: '修改时间',
      dataIndex: 'mtime',
    },
  ];
  return (
    <Modal
      visible={visible}
      width="80vw"
      bodyStyle={{
        height: '70vh',
        overflow: 'auto',
      }}
      centered
      maskClosable={false}
      closable={false}
      onCancel={() => {
        setVisible(false);
        resetVisible(undefined);
      }}
      onOk={() => {
        newProject(projectName, () => {
          setVisible(false);
          resetVisible(undefined);
        });
      }}
    >
      <FormItem label="项目名称" {...layout}>
        <Input
          onChange={e => {
            setProjectName(e.target.value);
          }}
        />
      </FormItem>
      <Table columns={columns} dataSource={fileList} />
    </Modal>
  );
};
