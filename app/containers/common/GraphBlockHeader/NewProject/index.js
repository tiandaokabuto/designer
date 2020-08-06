import React, { useState, useMemo } from 'react';
import { Modal, Form, Input, Table } from 'antd';

import {
  newProject,
  readAllFileName,
  openProject,
  formatDateTime,
} from '_utils/utils';
import {
  changeCurrentProject,
  changeProcessTree,
  changeCheckedTreeNode,
  resetGraphEditData,
} from '../../../reduxActions';

const FormItem = Form.Item;
const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 },
};

export default ({ resetVisible, tag }) => {
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
      render: formatDateTime,
    },
    {
      title: '修改时间',
      dataIndex: 'mtime',
      render: formatDateTime,
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
          // 保存当前的工程名字
          changeCurrentProject(projectName);
          resetGraphEditData();
          // changeProcessTree([]);
          // changeCheckedTreeNode(undefined);
        });
      }}
    >
      {tag === 'new' ? (
        <FormItem label="项目名称" {...layout}>
          <Input
            onChange={e => {
              setProjectName(e.target.value);
            }}
          />
        </FormItem>
      ) : null}

      <Table
        columns={columns}
        dataSource={fileList}
        scroll={{
          y: tag === 'new' ? 'calc(70vh - 230px)' : 'calc(70vh - 170px)',
        }}
        onRow={record => {
          return {
            onClick: event => {
              // 打开对应的项目
              openProject(record.name);
              changeCurrentProject(record.name);
              resetGraphEditData();
              // changeProcessTree([]);
              // changeCheckedTreeNode(undefined);
              setVisible(false);
              resetVisible(undefined);
            },
          };
        }}
      />
    </Modal>
  );
};
