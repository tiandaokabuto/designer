import React, {
  useState,
  useEffect,
  memo,
  useMemo,
  useRef,
  Fragment,
} from 'react';
import {
  Icon,
  Modal,
  Form,
  Input,
  message,
  Button,
  Tooltip,
  Radio,
} from 'antd';
import { withRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import useForceUpdate from 'react-hook-easier/lib/useForceUpdate';

import event from '../../designerGraphBlock/layout/eventCenter';
import { usePublishProcessZip } from '../../designerGraphBlock/layout/useHooks';
import { useTransformProcessToPython } from '../../designerGraphEdit/useHooks';
import IconFont from '../IconFont/index';
import usePersistentStorage from './useHooks/usePersistentStorage';
import useExecutePython from './useHooks/useExecutePython';
import useGetDownloadPath from './useHooks/useGetDownloadPath';
import useVerifyCompatibility from './useHooks/useVerifyCompatibility';
import useGetProcessName, {
  isEffectProcess,
} from './useHooks/useGetProcessName';
import {
  setAllModifiedState,
  setNodeModifiedState,
  downProcessZipToLocal,
  traverseTree,
  getModuleUniqueId,
  persistentModuleStorage,
  checkAndMakeDir,
  isDirNode,
  getUniqueId,
} from '../utils';
import {
  updateCurrentPagePosition,
  changeModuleTree,
  changeBlockTreeTab,
  changeProcessTree,
} from '../../reduxActions';
import api from '../../../api';
import { handleScreenCapture } from '@/containers/shared';
import PATH_CONFIG from '@/constants/localFilePath';

import NewProcess from './NewProcess';

import './index.scss';

const { remote, ipcRenderer } = require('electron');
const { exec } = require('child_process');
const fs = require('fs');
const process = require('process');
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
    const [isExport, setIsExport] = useState(false);
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
    const treeTabRef = useRef(null);
    treeTabRef.current = treeTab;

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
    const [exportType, setExportType] = useState('json');
    const [versionText, setVersionText] = useState('1.0.0'); // 默认值

    const [_, forceUpdate] = useForceUpdate();

    const uuidRef = useRef(null);

    const persistentStorage = usePersistentStorage();

    const handlePublishZip = usePublishProcessZip();

    const getProcessName = useGetProcessName();

    const getDownLoadPath = useGetDownloadPath();

    const transformProcessToPython = useTransformProcessToPython();

    const executePython = useExecutePython();

    const verifyCompatibility = useVerifyCompatibility();

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
        const uuid = new Date().getTime().toString(16);
        uuidRef.current = uuid;

        const find = TOOLS_DESCRIPTION_FOR_PROCESS.find(
          item => item.description === '运行'
        );
        find.description = '停止';
        find.onClick = function() {
          // 终止流程
          exec(`${process.cwd()}/app/common/python/stop.bat ${uuid}`, err => {
            if (!err) {
              message.success('停止成功');
            } else {
              message.error('停止失败');
            }
            console.log(err);
          });
          const find = TOOLS_DESCRIPTION_FOR_PROCESS.find(
            item => item.description === '停止'
          );
          find.description = '运行';
          find.onClick = handleOperation;
          forceUpdate();
        };
        transformProcessToPython();
        executePython(uuid, () => {
          const find = TOOLS_DESCRIPTION_FOR_PROCESS.find(
            item => item.description === '停止'
          );
          find.description = '运行';
          find.onClick = handleOperation;
          forceUpdate();
        });
        forceUpdate();
      } catch (e) {
        const find = TOOLS_DESCRIPTION_FOR_PROCESS.find(
          item => item.description === '停止' || item.description === '运行'
        );
        find.description = '运行';
        find.onClick = handleOperation;
        forceUpdate();
        message.error('代码转换出错，请检查流程图');
      }
    };

    const exportProcess = filePath => {
      const zip = new adm_zip();
      zip.addLocalFolder(
        `${process.cwd()}/project/${projectName}/${getProcessName()}`
      );
      zip.writeZip(`${filePath}.zip`);
    };

    const handleFilePath = (e, filePath) => {
      const unzip = new adm_zip(filePath[0]);
      const entry = unzip.getEntry('manifest.json');
      const data = JSON.parse(unzip.readAsText(entry, 'utf8'));
      const re = /([^\.\/\\]+)\.(?:[a-z]+)$/i;
      const fileName = re.exec(filePath[0])[1];
      if (treeTabRef.current === 'processModule') {
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
          // 写入文件
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
          // 没有选中流程块或者目录
          if (!currentCheckedModuleTreeNodeRef.current) {
            newModuleTree.push({
              title: fileName,
              type: 'process',
              key: getModuleUniqueId(newModuleTree),
              graphDataMap: {},
            });
          } else {
            // 对redux中的moduleTree进行修改
            traverseTree(newModuleTree, item => {
              if (currentCheckedModuleTreeNodeRef.current === item.key) {
                // 选中的是流程
                if (item.type === 'process') {
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
          persistentModuleStorage(newModuleTree, projectName);
        }
      } else {
        if (
          fs.existsSync(PATH_CONFIG('project', `${projectName}/${fileName}`))
        ) {
          message.info('流程已存在');
        } else {
          let newProcessTree = [...processTreeRef.current];
          const isDirNodeBool = isDirNode(
            processTreeRef.current,
            currentCheckedTreeNodeRef.current
          );
          const isLeafNodeOrUndefined =
            currentCheckedTreeNodeRef.current === undefined || !isDirNodeBool;
          const uniqueid = getUniqueId(processTreeRef.current);
          checkAndMakeDir(PATH_CONFIG('project', `${projectName}/${fileName}`));
          if (isLeafNodeOrUndefined) {
            newProcessTree.push({
              title: fileName,
              key: uniqueid,
              type: 'process',
              isLeaf: true,
              data,
            });
          } else {
            isDirNodeBool.children.push({
              title: fileName,
              key: uniqueid,
              type: 'process',
              isLeaf: true,
              data,
            });
          }
          event.emit('expandKeys', isDirNodeBool.key);
          changeProcessTree(newProcessTree);
          persistentStorage();
        }
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
            changeBlockTreeTab('atomic');
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
          onClick: () => {
            setNodeModifiedState(
              processTreeRef.current,
              currentCheckedTreeNodeRef.current
            );
            persistentStorage();
            message.success('保存成功');
          }, //handlePublishProcess,
        },
        {
          description: '运行',
          type: 'iconzhihang',
          IconFont: true,
          // disabled: true,
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
        type: 'download',
        // disabled: true,
        onClick: () => {
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
        description: '导出',
        type: 'upload',
        onClick: () => {
          console.log(treeTabRef.current);
          if (isEffectProcess()) {
            setIsExport(true);
            setModalVisible(true);
          } else {
            message.error('请选中流程再导出');
          }
        },
      },
      {
        description: '控制台',
        type: 'desktop',
        disabled: true,
      },
      {
        description: '校验',
        disabled: false,
        type: 'swap',
        onClick: verifyCompatibility,
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
          title={isExport ? '导出' : '流程发布至控制台'}
          visible={modalVisible}
          footer={
            <div>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  setIsExport(false);
                }}
              >
                取消
              </Button>
              {isExport ? (
                <Button
                  onClick={() => {
                    if (exportType === 'python') {
                      try {
                        transformProcessToPython();
                        // traverseTree(processTree, item => {
                        //   if (item.key === currentCheckedTreeNode) {
                        //     processName = item.title;
                        //   }
                        // });
                        getDownLoadPath(
                          downProcessZipToLocal,
                          getProcessName(),
                          descText,
                          versionText
                        );
                      } catch (e) {
                        message.error('代码转换出错，请检查流程图');
                        console.log(e);
                      }
                    } else {
                      getDownLoadPath(exportProcess);
                    }

                    setModalVisible(false);
                    setIsExport(false);
                  }}
                >
                  导出
                </Button>
              ) : (
                <Fragment>
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
                        getDownLoadPath(
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
                </Fragment>
              )}
            </div>
          }
          // onOk={hanldePublishModalOk}
          onCancel={() => {
            setIsExport(false);
            setModalVisible(false);
          }}
        >
          <Form {...layout} labelAlign="left">
            {isExport && (
              <FormItem label="类型">
                <Radio.Group
                  defaultValue={exportType}
                  onChange={e => setExportType(e.target.value)}
                >
                  <Tooltip title="json文件，可以给其他电脑使用">
                    <Radio value={'json'}>共享文件</Radio>
                  </Tooltip>
                  <Tooltip title="python文件，可供私有机器人离线使用">
                    <Radio value={'python'}>机器人文件</Radio>
                  </Tooltip>
                </Radio.Group>
              </FormItem>
            )}
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
