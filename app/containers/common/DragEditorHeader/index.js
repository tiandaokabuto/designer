import React, { useState, useEffect, memo, useMemo, useRef } from 'react';
import { Icon, Modal, Form, Input, message, Button } from 'antd';
import { withRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

import event from '../../designerGraphBlock/layout/eventCenter';
import { usePublishProcessZip } from '../../designerGraphBlock/layout/useHooks';
import { useTransformProcessToPython } from '../../designerGraphEdit/useHooks';
import IconFont from '../IconFont/index';
import usePersistentStorage from './useHooks/usePersistentStorage';
import useExecutePython from './useHooks/useExecutePython';
import useGetDownloadPath from './useHooks/useGetDownloadPath';
import useGetProcessName, {
  isEffectProcess
} from './useHooks/useGetProcessName';
import { setAllModifiedState } from '../utils';
import { updateCurrentPagePosition } from '../../reduxActions';
import api from '../../../api';

import NewProcess from './NewProcess';

import './index.scss';

const FormItem = Form.Item;
const { TextArea } = Input;
const layout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 21 }
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
    const [versionTipVisible, setVersionTipVisible] = useState(false);
    const [descText, setDescText] = useState('');
    const [versionText, setVersionText] = useState('1.0.0'); // 默认值

    const persistentStorage = usePersistentStorage();

    const handlePublishZip = usePublishProcessZip();

    const downloadPython = useGetDownloadPath();

    const getProcessName = useGetProcessName();

    const transformProcessToPython = useTransformProcessToPython();

    const executePython = useExecutePython();

    const getProcessVersion = processName => {
      axios
        .get(api('getProcessVersion'), {
          params: {
            processName
          }
        })
        .then(res => res.data)
        .then(res => {
          const version = res.data;
          if (res.message === '成功' && version) {
            const words = version.split('.');
            const lastWord = words[words.length - 1];
            let newVersion = '';
            for (let i = 0; i < words.length; i += 1) {
              if (i !== words.length - 1) {
                const word = words[i];
                newVersion += word.concat('.');
              } else {
                newVersion += parseInt(lastWord, 10) + 1;
              }
            }
            setVersionText(newVersion);
            return newVersion;
          }
          setVersionText('1.0.0');
          return false;
        })
        .catch(err => console.log(err));
    };

    const hanldePublishModalOk = () => {
      if (versionTipVisible) {
        message.error('版本格式错误，请检查您的版本号');
      } else {
        setModalVisible(false);
        transformProcessToPython();
        setTimeout(() => {
          handlePublishZip(descText, versionText);
        }, 0);
      }
    };

    const handleVersionTextChange = version => {
      const reg = /^([0]|[1-9][0-9]*)(\.([0]|[1-9][0-9]*)){1,2}$/;
      setVersionText(version);
      if (reg.test(version)) {
        setVersionTipVisible(false);
      } else {
        setVersionTipVisible(true);
      }
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
          }
        },
        {
          description: '上一步',
          type: 'save',
          disabled: true,
          onClick: () => {}
        },
        {
          description: '下一步',
          type: 'save',
          disabled: true,
          onClick: () => {}
        },
        {
          description: '保存',
          type: 'save',
          disabled: true,
          onClick: () => {} //handlePublishProcess,
        },
        {
          description: '运行',
          type: 'iconzhihang',
          IconFont: true,
          disabled: true,
          onClick: handleOperation
        },
        {
          description: '录制',
          type: 'iconrecordlight',
          disabled: true,
          IconFont: true
        },
        {
          description: '发布',
          type: 'cloud-upload',
          disabled: true
        },
        {
          description: '导出',
          disabled: true,
          type: 'upload'
        },
        {
          description: '控制台',
          disabled: true,
          type: 'desktop'
        }
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
        }
      },
      {
        description: '新建流程',
        type: 'save',
        onClick: () => {
          setVisible('newprocess');
        }
      },
      {
        description: '上一步',
        type: 'save',
        onClick: () => {
          event.emit('undo');
        }
      },
      {
        description: '下一步',
        type: 'save',
        onClick: () => {
          event.emit('redo');
        }
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
        IconFont: true
      },
      {
        description: '运行',
        type: 'iconrecordlight',
        IconFont: true,
        onClick: handleOperation
      },
      {
        description: '发布',
        type: 'cloud-upload',
        onClick: () => {
          if (isEffectProcess()) {
            getProcessVersion(getProcessName());
            setModalVisible(true);
          } else {
            message.error('未选择流程');
          }
        }
      },
      {
        description: '导出',
        type: 'upload',
        disabled: true
      },
      {
        description: '控制台',
        type: 'desktop',
        disabled: true
      }
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
          title="流程发布至控制台"
          visible={modalVisible}
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
          <Form {...layout} labelAlign="left">
            <FormItem label="描述">
              <TextArea
                placeholder="请输入流程描述"
                autoSize={{ minRows: 6, maxRows: 8 }}
                onChange={e => {
                  setDescText(e.target.value);
                }}
              />
            </FormItem>
            <FormItem label="版本号" className="versionInput">
              <Input
                className={versionTipVisible && 'errorFomat'}
                placeholder="请输入版本号"
                value={versionText}
                onChange={e => {
                  handleVersionTextChange(e.target.value);
                }}
              />
              {versionTipVisible && (
                <span className="versionTip">
                  版本号格式错误，版本号的格式为x.x或者x.x.x，x为正整数
                </span>
              )}
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  })
);
