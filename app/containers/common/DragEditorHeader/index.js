import React, { useState, memo, useEffect, useRef, Fragment } from 'react';
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
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import useForceUpdate from 'react-hook-easier/lib/useForceUpdate';

import event, {
  STOP_RUNNING,
  START_POINT,
} from '../../designerGraphBlock/layout/eventCenter';
import {
  UNDO_CARDSDATA,
  REDO_CARDSDATA,
  RESET_PENDING_QUEUE,
  CHANGE_FORCEUPDATE_TAG,
} from '../../../actions/codeblock';
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
  changeModifyState,
  downProcessZipToLocal,
  getChooseFilePath,
  transformPythonWithPoint,
  deleteFolderRecursive,
} from '../utils';
import {
  updateCurrentPagePosition,
  changeBlockTreeTab,
} from '../../reduxActions';
import api from '../../../api';
import PATH_CONFIG from '@/constants/localFilePath.js';
import RedoPNG from '@/containers/images/redo.png';
import UndoPNG from '@/containers/images/undo.png';
import { designerVersion } from '../GraphBlockHeader/HelpModel/version';

import NewProcess from './NewProcess';

import './index.scss';

const { remote, ipcRenderer } = require('electron');
const { exec } = require('child_process');
const process = require('process');
const fs = require('fs');
const adm_zip = require('adm-zip');

const FormItem = Form.Item;
const { TextArea } = Input;
const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};

export default memo(
  withRouter(({ history }) => {
    const dispatch = useDispatch();
    const forceUpdateTag = useSelector(state => state.blockcode.forceUpdateTag);

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
    const [versionTipVisible2, setVersionTipVisible2] = useState(false);
    const [descText, setDescText] = useState('');
    const [exportType, setExportType] = useState('json');
    const [versionText, setVersionText] = useState('0.0.1'); // 默认值
    const [originVersion, setOriginVersion] = useState('0.0.1'); // 默认值
    const [isRunCode, setIsRunCode] = useState(false); // 默认值
    const [tools, setTools] = useState([]);

    const uuidRef = useRef(null);

    const persistentStorage = usePersistentStorage();

    const handlePublishZip = usePublishProcessZip();

    const getProcessName = useGetProcessName();

    const getDownLoadPath = useGetDownloadPath();

    const transformProcessToPython = useTransformProcessToPython();

    const executePython = useExecutePython();

    const verifyCompatibility = useVerifyCompatibility();

    const key = 'runCode';

    const getProcessVersion = processName => {
      axios
        .get(api('getProcessVersion'), {
          params: {
            processName,
          },
        })
        .then(res => res.data)
        .then(res => {
          const version = res.data;
          if (res.code !== -1 && version) {
            setOriginVersion(version);
            const nextVersion = version.replace(/[\d]+$/, match => +match + 1);
            setVersionText(nextVersion);
            return nextVersion;
          }
          setVersionText('0.0.1');
          setOriginVersion('0.0.1');
          return false;
        })
        .catch(err => console.log(err));
    };

    const hanldePublishModalOk = () => {
      if (versionTipVisible) {
        message.error('版本格式错误，请检查您的版本号');
      } else if (versionTipVisible2) {
        message.error('新版本号小于当前版本号，请重新输入');
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
      // 格式匹配
      if (reg.test(version)) {
        setVersionTipVisible(false);
        const originVersionArray = originVersion.split('.');
        const currentVersionArray = version.split('.');
        const minLength =
          originVersionArray.length > currentVersionArray.length
            ? currentVersionArray.length
            : originVersionArray.length;
        let isVerisonSmallerThanOriginVerison = false;
        // origin: 2.0 current: 1.0.1
        for (let i = 0; i < minLength; i += 1) {
          if (originVersionArray[i] > currentVersionArray[i]) {
            isVerisonSmallerThanOriginVerison = true;
            setVersionTipVisible2(true);
            break;
          }
        }
        if (!isVerisonSmallerThanOriginVerison) {
          setVersionTipVisible2(false);
        }
      } else {
        setVersionTipVisible(true);
        setVersionTipVisible2(false);
      }
    };

    const handleOperation = (fromOrTo = undefined) => {
      try {
        const uuid = new Date().getTime().toString(16);
        uuidRef.current = uuid;
        if (fromOrTo === undefined) {
          transformProcessToPython();
        } else {
          console.log();
          transformPythonWithPoint(fromOrTo);
        }
        executePython(uuid, () => {
          setIsRunCode(false);
        });
        message.loading({ content: '程序运行中', duration: 0, key });
      } catch (e) {
        setIsRunCode(false);
        message.error('代码转换出错，请检查流程图');
      }
    };

    const handleStopProcess = () => {
      // 终止流程
      const stopFilePath = `${process.cwd()}/../Python/python3_lib/Lib/site-packages/sendiRPA/stopUtils/stop.bat ${
        uuidRef.current
      }`;
      message.warn({ content: '流程停止中', duration: 0, key });
      exec(stopFilePath, err => {
        if (!err) {
          message.success({ content: '停止成功', key });
        } else {
          message.error({ content: '停止失败', key });
        }
        console.log(err);
      });
      setIsRunCode(false);
    };

    const exportProcess = filePath => {
      const zip = new adm_zip();
      fs.writeFileSync(
        `${process.cwd()}/project/${projectName}/${getProcessName()}/designerVersion.json`,
        JSON.stringify({
          designerVersion,
        })
      );
      zip.addLocalFolder(
        `${process.cwd()}/project/${projectName}/${getProcessName()}`
      );
      // deleteFolderRecursive(
      //   `${process.cwd()}/project/${projectName}/${getProcessName()}/designerVersion.json`
      // );
      zip.writeZip(`${filePath}.zip`);
    };

    const handleRunPoint = fromOrTo => {
      setIsRunCode(true);
      handleOperation(fromOrTo);
    };

    useEffect(() => {
      event.addListener(START_POINT, handleRunPoint);
      return () => {
        event.removeListener(START_POINT, handleRunPoint);
      };
    }, []);

    useEffect(() => {
      const toolsDescriptionForBlock = [
        {
          description: '返回',
          type: 'rollback',
          IconFont: false,
          onClick: () => {
            event.emit('toggle');
            updateCurrentPagePosition('editor');
            changeBlockTreeTab('atomic');
            dispatch({
              type: RESET_PENDING_QUEUE,
            });
            history.goBack();
          },
        },
        {
          description: '撤销',
          iconImg: true,
          type: UndoPNG,
          // disabled: true,
          onClick: () => {
            dispatch({
              type: CHANGE_FORCEUPDATE_TAG,
              payload: !forceUpdateTag,
            });
            dispatch({
              type: UNDO_CARDSDATA,
            });
            // setTimeout(() => {
            //   dispatch({
            //     type: CHANGE_FORCEUPDATE_TAG,
            //     payload: false,
            //   });
            // }, 0);
          },
        },
        {
          description: '恢复',
          iconImg: true,
          type: RedoPNG,
          // disabled: true,
          onClick: () => {
            dispatch({
              type: CHANGE_FORCEUPDATE_TAG,
              payload: !forceUpdateTag,
            });
            dispatch({
              type: REDO_CARDSDATA,
            });
            // setTimeout(() => {
            //   dispatch({
            //     type: CHANGE_FORCEUPDATE_TAG,
            //     payload: false,
            //   });
            // }, 0);
          },
        },
        {
          description: '运行',
          type: 'code',
          hide: isRunCode,
          onClick: () => {
            setIsRunCode(true);
            handleOperation();
          },
        },
        {
          description: '停止',
          type: 'icontingzhi',
          IconFont: true,
          hide: !isRunCode,
          onClick: () => {
            handleStopProcess();
          },
        },
        {
          description: '保存',
          type: 'save',
          onClick: () => {
            changeModifyState(
              processTreeRef.current,
              currentCheckedTreeNodeRef.current,
              false
            );
            persistentStorage();
            message.success('保存成功');
          },
        },
        /*  {
          description: '录制',
          type: 'iconrecordlight',
          disabled: true,
          IconFont: true,
        }, */
        {
          description: '发布',
          type: 'cloud-upload',
          disabled: true,
        },
        {
          description: '导入',
          disabled: true,
          type: 'login',
          rotate: 180,
        },
        {
          description: '导出',
          disabled: true,
          type: 'logout',
        },
        {
          description: '控制台',
          disabled: true,
          type: 'desktop',
        },
      ];
      const toolsDescriptionForProcess = [
        {
          description: '新建目录',
          type: 'plus-circle',
          IconFont: false,
          onClick: () => {
            setVisible('newdir');
          },
        },
        {
          description: '新建流程',
          type: 'cluster',
          onClick: () => {
            setVisible('newprocess');
          },
        },
        {
          description: '撤销',
          iconImg: true,
          type: UndoPNG,
          onClick: () => {
            event.emit('undo');
          },
        },
        {
          description: '恢复',
          iconImg: true,
          type: RedoPNG,
          onClick: () => {
            event.emit('redo');
          },
        },
        {
          description: '运行',
          type: 'code',
          hide: isRunCode,
          onClick: () => {
            setIsRunCode(true);
            handleOperation();
          },
        },
        {
          description: '停止',
          type: 'icontingzhi',
          IconFont: true,
          hide: !isRunCode,
          onClick: () => {
            handleStopProcess();
          },
        },
        {
          description: '保存',
          type: 'save',
          onClick: () => {
            // 保存到本地
            changeModifyState(
              processTreeRef.current,
              currentCheckedTreeNodeRef.current,
              false
            );
            persistentStorage();
            message.success('保存成功');
          },
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
          type: 'login',
          rotate: 180,
          // disabled: true,
          onClick: () => {
            ipcRenderer.removeAllListeners('chooseItem');
            ipcRenderer.send(
              'choose-directory-dialog',
              'showOpenDialog',
              '选择',
              ['openFile']
            );
            ipcRenderer.on('chooseItem', (e, filePath) => {
              getChooseFilePath(filePath, 'process');
            });
          },
        },
        {
          description: '导出',
          type: 'logout',
          onClick: () => {
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
      if (history.location.pathname.includes('block')) {
        setTools(toolsDescriptionForBlock);
      } else {
        setTools(toolsDescriptionForProcess);
      }
    }, [isRunCode, history.location.pathname]);

    const renderIcon = tool => {
      if (tool.IconFont) {
        return <IconFont type={tool.type} />;
      } else if (tool.iconImg) {
        return <img src={tool.type} alt={tool.description} />;
      } else {
        return <Icon type={tool.type} rotate={tool.rotate ? tool.rotate : 0} />;
      }
    };

    return (
      <div className="drageditor-header">
        {tools.map((tool, index) =>
          tool.hide ? null : (
            <span
              key={tool.description}
              onClick={() => {
                if (!tool.disabled && tool.onClick) tool.onClick();
              }}
              className={`drageditor-header-operation ${
                tool.disabled ? 'drageditor-header-operation__disabled' : ''
              }`}
            >
              {renderIcon(tool)}
              {tool.description}
            </span>
          )
        )}
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
                      getDownLoadPath(exportProcess, getProcessName());
                    }

                    setModalVisible(false);
                    setIsExport(false);
                  }}
                >
                  导出
                </Button>
              ) : (
                <Fragment>
                  {/* <Button
                    type="dashed"
                    onClick={() => {
                      setModalVisible(false);
                      let processName = '';
                      try {
                        transformProcessToPython();
                        traverseTree(processTree, (item) => {
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
                  </Button> */}
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
            <FormItem label="当前版本号" className="versionInput">
              <span style={{ paddingLeft: '12px' }}>{originVersion}</span>
            </FormItem>
            <FormItem label="最新版本号" className="versionInput">
              <Input
                className={
                  versionTipVisible || versionTipVisible2 ? 'errorFomat' : ''
                }
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
              {versionTipVisible2 && (
                <span className="versionTip">最新版本应大于当前版本</span>
              )}
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  })
);
