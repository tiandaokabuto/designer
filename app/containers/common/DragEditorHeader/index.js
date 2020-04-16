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
  isEffectProcess,
} from './useHooks/useGetProcessName';
import {
  setAllModifiedState,
  setNodeModifiedState,
  downProcessZipToLocal,
  traverseTree,
  getModuleUniqueId,
} from '../utils';
import {
  updateCurrentPagePosition,
  changeModuleTree,
} from '../../reduxActions';
import api from '../../../api';
import { handleScreenCapture } from '@/containers/shared';
import PATH_CONFIG from '@/constants/localFilePath';

import NewProcess from './NewProcess';

import './index.scss';

const { remote, ipcRenderer } = require('electron');
const fs = require('fs');
const adm_zip = require('adm-zip');

const FormItem = Form.Item;
const { TextArea } = Input;
const layout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 21 },
};

export default memo(
  withRouter(({ history, type }) => {
    const [visible, setVisible] = useState(undefined);
    const resetVisible = () => {
      setVisible(undefined);
    };

    const currentCheckedTreeNode = useSelector(
      state => state.grapheditor.currentCheckedTreeNode
    );
    const currentCheckedTreeNodeRef = useRef(null);
    currentCheckedTreeNodeRef.current = currentCheckedTreeNode;

    const currentCheckedModuleTreeNode = useSelector(
      state => state.grapheditor.currentCheckedModuleTreeNode
    );
    const currentCheckedModuleTreeNodeRef = useRef(null);
    currentCheckedModuleTreeNodeRef.current = currentCheckedModuleTreeNode;

    const treeTab = useSelector(state => state.grapheditor.treeTab);
    const projectName = useSelector(state => state.grapheditor.currentProject);

    const processTree = useSelector(state => state.grapheditor.processTree);
    const processTreeRef = useRef(null);
    processTreeRef.current = processTree;

    const moduleTree = useSelector(state => state.grapheditor.moduleTree);
    const moduleTreeRef = useRef(null);
    moduleTreeRef.current = moduleTree;

    const [modalVisible, setModalVisible] = useState(false);
    const [versionTipVisible, setVersionTipVisible] = useState(false);
    const [descText, setDescText] = useState('');
    const [versionText, setVersionText] = useState('1.0.0'); // 默认值

    const persistentStorage = usePersistentStorage();

    const handlePublishZip = usePublishProcessZip();

    const getProcessName = useGetProcessName();

    const downloadPython = useGetDownloadPath();

    const transformProcessToPython = useTransformProcessToPython();

    const executePython = useExecutePython();

    const getProcessVersion = processName => {
      axios
        .get(api('getProcessVersion'), {
          params: {
            processName,
          },
        })
        .then(res => res.data)
        .then(res => {
          let version = res.data;
          if (res.code !== -1 && version) {
            version = version.replace(/[\d]+$/, match => +match + 1);
            handleVersionTextChange(version);
            return version;
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

        try {
          transformProcessToPython();
          setTimeout(() => {
            handlePublishZip(descText, versionText);
          }, 0);
        } catch (e) {
          message.error('代码转换出错，请检查流程图');
          console.log(e);
        }
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
      try {
        transformProcessToPython();
        executePython();
      } catch (e) {
        console.log(e);
        message.error('代码转换出错，请检查流程图');
      }
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
          setNodeModifiedState(
            processTreeRef.current,
            currentCheckedTreeNodeRef.current
          );
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
        disabled: remote.getGlobal('sharedObject').userName === '',
        onClick: () => {
          if (isEffectProcess()) {
            getProcessVersion(getProcessName());
            setModalVisible(true);
          } else {
            message.error('未选择流程');
          }
        },
      },
      {
        description: '导入',
        type: 'upload',
        // disabled: true,
        onClick: () => {
          const handleFilePath = (e, filePath) => {
            const unzip = new adm_zip(filePath[0]);
            const entry = unzip.getEntry('manifest.json');
            const data = JSON.parse(unzip.readAsText(entry, 'utf8'));
            const re = /([^\.\/\\]+)\.(?:[a-z]+)$/i;
            const fileName = re.exec(filePath[0])[1];
            if (
              fs.existsSync(
                PATH_CONFIG(
                  'project',
                  `${projectName}/${projectName}_module/${fileName}.json`
                )
              )
            ) {
              message.info('该流程块已存在');
            } else {
              fs.writeFileSync(
                PATH_CONFIG(
                  'project',
                  `${projectName}/${projectName}_module/${fileName}.json`
                ),
                JSON.stringify({
                  graphDataMap: data,
                })
              );
              const newModuleTree = [...moduleTreeRef.current];
              if (!currentCheckedModuleTreeNodeRef.current) {
                // 没有选中
                newModuleTree.push({
                  title: fileName,
                  type: 'process',
                  key: getModuleUniqueId(newModuleTree),
                  graphDataMap: {},
                });
              } else {
                traverseTree(newModuleTree, item => {
                  if (currentCheckedModuleTreeNodeRef.current === item.key) {
                    if (item.type === 'process') {
                      // 选中的是流程
                      newModuleTree.push({
                        title: fileName,
                        type: 'process',
                        key: getModuleUniqueId(newModuleTree),
                        graphDataMap: {},
                      });
                    } else {
                      // 选中的是目录
                      item.children.push({
                        title: fileName,
                        type: 'process',
                        key: getModuleUniqueId(newModuleTree),
                        graphDataMap: {},
                      });
                    }
                  }
                });
              }
              changeModuleTree(newModuleTree);
              fs.readFile(
                PATH_CONFIG(
                  'project',
                  `${projectName}/${projectName}_module/manifest.json`
                ),
                function(err, data) {
                  if (!err) {
                    let description = JSON.parse(data.toString());
                    console.log(description);
                    fs.writeFile(
                      PATH_CONFIG(
                        'project',
                        `${projectName}/${projectName}_module/manifest.json`
                      ),
                      JSON.stringify({
                        ...description,
                        moduleTree: newModuleTree,
                      }),
                      function(err) {
                        if (err) {
                          console.error(err);
                        }
                      }
                    );
                  }
                }
              );
            }
          };
          ipcRenderer.removeAllListeners('chooseItem');
          ipcRenderer.send(
            'choose-directory-dialog',
            'showOpenDialog',
            '选择',
            ['openFile']
          );
          ipcRenderer.on('chooseItem', handleFilePath);
        },
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
            onClick={() => {
              if (!tool.disabled && tool.onClick) tool.onClick();
            }}
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
                  let processName = '';
                  try {
                    transformProcessToPython();
                    traverseTree(processTree, item => {
                      if (item.key === currentCheckedTreeNode) {
                        processName = item.title;
                      }
                    });
                    downloadPython(
                      downProcessZipToLocal,
                      processName,
                      descText,
                      versionText
                    );
                  } catch (e) {
                    message.error('代码转换出错，请检查流程图');
                    console.log(e);
                  }
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
          onCancel={() => {
            setModalVisible(false);
          }}
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
                className={versionTipVisible ? 'errorFomat' : ''}
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
