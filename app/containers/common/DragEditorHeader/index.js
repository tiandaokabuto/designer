import React, { useState, useEffect, memo, useMemo, useRef } from 'react';
import { Icon, Modal, Form, Input, message, Button } from 'antd';
import { withRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';

import event from '../../designerGraphBlock/layout/eventCenter';
import { usePublishProcessZip } from '../../designerGraphBlock/layout/useHooks';
import { useTransformProcessToPython } from '../../designerGraphEdit/useHooks';
import IconFont from '../IconFont/index';
import usePersistentStorage from './useHooks/usePersistentStorage';
import useExecutePython from './useHooks/useExecutePython';
import useGetDownloadPath from './useHooks/useGetDownloadPath';
import { setAllModifiedState } from '../utils';
import { updateCurrentPagePosition } from '../../reduxActions';

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
    const processTreeRef = useRef(null);
    processTreeRef.current = processTree;

    const [modalVisible, setModalVisible] = useState(false);
    const [descText, setDescText] = useState('');

    const persistentStorage = usePersistentStorage();

    const handlePublishZip = usePublishProcessZip();

    const downloadPython = useGetDownloadPath();

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
            updateCurrentPagePosition('editor');
            history.goBack();
          },
        },
        {
          description: '上一步',
          type: 'save',
          disabled: true,
          onClick: () => {},
        },
        {
          description: '下一步',
          type: 'save',
          disabled: true,
          onClick: () => {},
        },
        {
          description: '保存',
          type: 'save',
          disabled: true,
          onClick: () => {}, //handlePublishProcess,
        },
        {
          description: '运行',
          type: 'iconzhihang',
          IconFont: true,
          disabled: true,
          onClick: handleOperation,
        },
        {
          description: '录制',
          type: 'iconrecordlight',
          disabled: true,
          IconFont: true,
        },
        {
          description: '发布',
          type: 'cloud-upload',
          disabled: true,
        },
        {
          description: '导出',
          disabled: true,
          type: 'upload',
        },
        {
          description: '控制台',
          disabled: true,
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
          setVisible('newdir');
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
        onClick: () => {
          event.emit('undo');
        },
      },
      {
        description: '下一步',
        type: 'save',
        onClick: () => {
          event.emit('redo');
        },
      },
      {
        description: '保存',
        type: 'iconzhihang',
        onClick: () => {
          // 保存到本地
          setAllModifiedState(processTreeRef.current);
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
        disabled: true,
      },
      {
        description: '控制台',
        type: 'desktop',
        disabled: true,
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
          <span
            key={index}
            onClick={tool.onClick || (() => {})}
            className={`drageditor-header-operation ${
              tool.disabled ? 'drageditor-header-operation__disabled' : ''
            }`}
          >
            {tool.IconFont ? (
              <IconFont type={tool.type} />
            ) : (
              <Icon type={tool.type} />
            )}
            {tool.description}
          </span>
        ))}
        {(visible === 'newprocess' || visible === 'newdir') && (
          <NewProcess resetVisible={resetVisible} tag={visible} />
        )}
        <Modal
          visible={modalVisible}
          closable={false}
          footer={
            <div>
              <Button
                onClick={() => {
                  setModalVisible(false);
                }}
              >
                取消
              </Button>
              <Button
                type="dashed"
                onClick={() => {
                  setModalVisible(false);
                  transformProcessToPython();
                  downloadPython();
                }}
              >
                下载到本地
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  hanldePublishModalOk();
                }}
              >
                发布
              </Button>
            </div>
          }
          // onOk={hanldePublishModalOk}
          // onCancel={() => {
          //   setModalVisible(false);
          // }}
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
