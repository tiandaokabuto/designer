import React, { useState, useEffect, memo, useMemo } from 'react';
import { Icon, Modal, Form, Input, message } from 'antd';
import { withRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';

import event, {
  PYTHON_EXECUTE,
} from '../../designerGraphBlock/layout/eventCenter';
import { usePublishProcessZip } from '../../designerGraphBlock/layout/useHooks';
import { useTransformProcessToPython } from '../../designerGraphEdit/useHooks';
import IconFont from '../IconFont/index';
import usePersistentStorage from './useHooks/usePersistentStorage';
import useExecutePython from './useHooks/useExecutePython';
import { setAllModifiedState } from '../utils';

import NewProcess from './NewProcess';

import './index.scss';

const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 6 },
};

export default memo(
  withRouter(({ history, type }) => {
    const [visible, setVisible] = useState(undefined);
    const resetVisible = () => {
      setVisible(undefined);
    };

    const processTree = useSelector(state => state.grapheditor.processTree);

    const [modalVisible, setModalVisible] = useState(false);
    const [descText, setDescText] = useState('');

    const persistentStorage = usePersistentStorage();

    const handlePublishZip = usePublishProcessZip();

    const transformProcessToPython = useTransformProcessToPython();

    const executePython = useExecutePython();

    const hanldePublishModalOk = () => {
      setModalVisible(false);
      transformProcessToPython();
      setTimeout(() => {
        handlePublishZip(descText);
      }, 0);
    };

    const handleOperation = () => {
      transformProcessToPython();
      executePython();
    };

    const TOOLS_DESCRIPTION_FOR_CODEBLOCK = useMemo(
      () => [
        {
          description: '返回',
          type: 'rollback',
          IconFont: false,
          onClick: () => {
            event.emit('toggle');
            history.goBack();
          },
        },
        {
          description: '上一步',
          type: 'save',
          onClick: () => {},
        },
        {
          description: '下一步',
          type: 'save',
          onClick: () => {},
        },
        {
          description: '保存',
          type: 'save',
          onClick: () => {}, //handlePublishProcess,
        },
        {
          description: '运行',
          type: 'iconzhihang',
          IconFont: true,
          onClick: handleOperation,
        },
        {
          description: '录制',
          type: 'iconrecordlight',
          IconFont: true,
        },
        {
          description: '发布',
          type: 'cloud-upload',
        },
        {
          description: '导出',
          type: 'upload',
        },
        {
          description: '控制台',
          type: 'desktop',
        },
      ],
      []
    );

    const TOOLS_DESCRIPTION_FOR_PROCESS = [
      {
        description: '新建目录',
        type: 'rollback',
        IconFont: false,
        onClick: () => {
          setVisible('newprocess');
        },
      },
      {
        description: '新建流程',
        type: 'save',
        onClick: () => {
          setVisible('newprocess');
        },
      },
      {
        description: '上一步',
        type: 'save',
      },
      {
        description: '下一步',
        type: 'save',
      },
      {
        description: '保存',
        type: 'iconzhihang',
        onClick: () => {
          // 保存到本地
          setAllModifiedState(processTree);
          persistentStorage();
          message.success('保存成功');
        },
        IconFont: true,
      },
      {
        description: '运行',
        type: 'iconrecordlight',
        IconFont: true,
        onClick: handleOperation,
      },
      {
        description: '发布',
        type: 'cloud-upload',
        onClick: () => {
          setModalVisible(true);
        },
      },
      {
        description: '导出',
        type: 'upload',
      },
      {
        description: '控制台',
        type: 'desktop',
      },
    ];

    const [tools, setTools] = useState(
      type === 'process'
        ? TOOLS_DESCRIPTION_FOR_PROCESS
        : TOOLS_DESCRIPTION_FOR_CODEBLOCK
    );

    return (
      <div className="drageditor-header">
        {tools.map((tool, index) => (
          <span key={index} onClick={tool.onClick || (() => {})}>
            {tool.IconFont ? (
              <IconFont type={tool.type} />
            ) : (
              <Icon type={tool.type} />
            )}
            {tool.description}
          </span>
        ))}
        {visible === 'newprocess' && <NewProcess resetVisible={resetVisible} />}
        <Modal
          visible={modalVisible}
          closable={false}
          onOk={hanldePublishModalOk}
          onCancel={() => {
            setModalVisible(false);
          }}
        >
          <FormItem label="流程描述">
            <Input
              placeholder="请输入流程描述"
              onChange={e => {
                setDescText(e.target.value);
              }}
            />
          </FormItem>
        </Modal>
      </div>
    );
  })
);
