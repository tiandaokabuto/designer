import React, { useState, useRef } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { useSelector } from 'react-redux';

import { newProcess, persistentStorage, isNameExist } from '../../utils';

const FormItem = Form.Item;
const Option = Select.Option;
const layout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 16 },
};
export default ({ resetVisible, tag }) => {
  const [visible, setVisible] = useState(true);
  // 新建类型 process --- 流程  project --- 项目
  // const [type, setType] = useState(tag === 'newprocess' ? 'dir' : 'process');
  // 类型/目录名称
  const [name, setName] = useState();
  const checkedTreeNode = useSelector(
    state => state.grapheditor.currentCheckedTreeNode
  );

  const processTree = useSelector(state => state.grapheditor.processTree);
  const currentProject = useSelector(state => state.grapheditor.currentProject);
  // const currentCheckedTreeNode = useSelector(state => state.grapheditor.currentCheckedTreeNode);

  /* ---------- 流程/目录新增逻辑 ----------- */
  const handleAddProcessOrProject = () => {
    // 做流程名校验避免重复
    if (isNameExist(processTree, name, checkedTreeNode, currentProject)) {
      return void message.info(
        `${tag === 'newprocess' ? '流程名' : '目录名'}重复,请重新填写!`
      );
    }
    const [newProcessTree, uniqueid] = newProcess(
      tag === 'newprocess' ? 'process' : 'dir',
      name,
      processTree,
      checkedTreeNode,
      currentProject
    );
    setVisible(false);
    resetVisible(undefined);
    persistentStorage(undefined, newProcessTree, currentProject, uniqueid);
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
      {/* <FormItem label="选择类型" {...layout}>
        <Select
          style={{
            width: '100%',
          }}
          onChange={value => {
            setType(value);
          }}
        >
          <Option value="process">流程</Option>
          <Option value="dir">目录</Option>
        </Select>
      </FormItem> */}
      <FormItem label={tag === 'newprocess' ? '流程名' : '目录名'} {...layout}>
        <Input
          onChange={e => {
            setName(e.target.value);
          }}
        />
      </FormItem>
    </Modal>
  );
};
