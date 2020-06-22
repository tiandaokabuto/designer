import React, { useState, useRef } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { useSelector } from 'react-redux';

import {
  newProcessOrDir,
  persistentStorage,
  isNameExist,
  isDirNameExist,
  persistentManifest,
} from '../../utils';

const FormItem = Form.Item;
const { Option } = Select;
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
  const checkedModuleTreeNode = useSelector(
    state => state.grapheditor.currentCheckedModuleTreeNode
  );
  const treeTab = useSelector(state => state.grapheditor.treeTab);
  const moduleTree = useSelector(state => state.grapheditor.moduleTree);
  const processTree = useSelector(state => state.grapheditor.processTree);
  const currentProject = useSelector(state => state.grapheditor.currentProject);
  // const currentCheckedTreeNode = useSelector(state => state.grapheditor.currentCheckedTreeNode);

  /* ---------- 流程/目录新增逻辑 ----------- */
  const handleAddProcessOrProject = () => {
    if (!name) {
      message.info('请填写名称');
      return;
    }
    const reg = /(^\s+)|(\s+$)|[?:<>|*"{}\[\]\/\\]/g;
    if (reg.test(name)) {
      message.error('不能包含特殊字符，前后不能包含空格');
      return;
    }
    if (name.length > 100) {
      message.info('输入的内容长度不能大于100');
      return;
    }
    if (treeTab !== 'processModule') {
      // 做流程名校验避免重复
      if (tag === 'newprocess') {
        if (isNameExist(processTree, name, checkedTreeNode, currentProject)) {
          return void message.info('流程名重复,请重新填写!');
        }
      } else if (isDirNameExist(processTree, name)) {
        return void message.info('目录名重复,请重新填写!');
      }
      const [newProcessTree, uniqueid] = newProcessOrDir(
        tag === 'newprocess' ? 'process' : 'dir',
        name,
        processTree,
        checkedTreeNode,
        currentProject,
        'process'
      );
      setVisible(false);
      resetVisible(undefined);
      persistentStorage([uniqueid], newProcessTree, currentProject, uniqueid);
    } else if (tag !== 'newprocess') {
      const [newModuleTree, uniqueid] = newProcessOrDir(
        '',
        name,
        moduleTree,
        checkedModuleTreeNode,
        currentProject,
        'processModule'
      );
      setVisible(false);
      resetVisible(undefined);
      persistentManifest(newModuleTree, currentProject, 'moduleTree');
      // persistentModuleStorage(newModuleTree, currentProject, uniqueid);
      console.log('选择了流程块');
    } else {
      message.info('流程块页面不能新增流程');
      setVisible(false);
      resetVisible(undefined);
    }
  };
  return (
    <Modal
      visible={visible}
      width="50vw"
      bodyStyle={{
        // height: '50vh',
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
