import React, { useState } from 'react';
import { Modal, Form, Input, Select } from 'antd';
import { useSelector } from 'react-redux';

import { newProcess } from '../../utils';

const FormItem = Form.Item;
const Option = Select.Option;
const layout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 16 },
};
export default ({ resetVisible }) => {
  const [visible, setVisible] = useState(true);
  // 新建类型 process --- 流程  project --- 项目
  const [type, setType] = useState(undefined);
  // 类型/项目名称
  const [name, setName] = useState();
  const checkedTreeNode = useSelector(
    state => state.grapheditor.currentCheckedTreeNode
  );
  const processTree = useSelector(state => state.grapheditor.processTree);

  /* ---------- 流程/项目新增逻辑 ----------- */
  const handleAddProcessOrProject = () => {
    newProcess(type, name, processTree, checkedTreeNode);
    setVisible(false);
    resetVisible(undefined);
  };
  return (
    <Modal
      visible={visible}
      width="50vw"
      bodyStyle={{
        height: '50vh',
        overflow: 'auto',
      }}
      centered
      maskClosable={false}
      closable={false}
      onOk={handleAddProcessOrProject}
      onCancel={() => {
        setVisible(false);
        resetVisible(undefined);
      }}
    >
      <FormItem label="选择类型" {...layout}>
        <Select
          style={{
            width: '100%',
          }}
          onChange={value => {
            setType(value);
          }}
        >
          <Option value="process">流程</Option>
          <Option value="project">项目</Option>
        </Select>
      </FormItem>
      <FormItem label="流程/项目名称" {...layout}>
        <Input
          onChange={e => {
            setName(e.target.value);
          }}
        />
      </FormItem>
    </Modal>
  );
};
