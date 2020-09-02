import React, { useEffect, useState, memo, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import useThrottle from 'react-hook-easier/lib/useThrottle';
import { useInjectContext } from 'react-hook-easier/lib/useInjectContext';
import { Icon, Input, Dropdown, Menu, Tag, Tabs, Tree, message } from 'antd';
import uniqueId from 'lodash/uniqueId';

import FilterToolbar from './FilterToolbar';
import Tags from './Tags';
import ZoomToolBar from './ZoomToolBar';
import useGetDownloadPath from '../../common/DragEditorHeader/useHooks/useGetDownloadPath';

import DebugBtn from './DebugBtn/DebugBtn';

import './OutputPanel.scss';

// liuqi
import { useTransformProcessToPython } from '../../designerGraphEdit/useHooks';
import {
  runDebugServer,
  runAllStepByStepAuto,
  killTask,
} from '../../../utils/DebugUtils/runDebugServer';
import {
  getDebugIndex,
  getTempCenter,
  setPause,
  clearPause,
} from '../../designerGraphEdit/RPAcore';
import { PYTHON_OUTPUT, PYTHON_OUTPUT_CLEAR } from '@/containers/eventCenter';

// liuqi-new
import event from '../../eventCenter';
import { changeDebugInfos } from '../../reduxActions';
import {
  DEBUG_OPEN_DEBUGSERVER,
  DEBUG_CLOSE_DEBUGSERVER,
  DEBUG_RUN_STEP_BY_STEP,
  DEBUG_SET_PAUSE,
  DEBUG_CONTINUE,
  DEBUG_CONTINUE_ONESTEP_NEXT,
  DEBUG_RESET_CODE,
  DEBUG_SOURCECODE_INSERT,
} from '../../../constants/actions/debugInfos';

import { sendChangeVariable } from '../../../utils/DebugUtils/runDebugServer';

const fs = require('fs');
const { TabPane } = Tabs;

const { TreeNode, DirectoryTree } = Tree;

let isMouseDown = false;
let startOffset = 0;
let originKey = 0;
const allLogMessage = { value: '' };

const { Search } = Input;

const tagsFromServer = [
  { label: 'DEBUG', icon: 'warning', fill: '#0060bf' },
  { label: 'INFO', icon: 'info-circle', fill: '#dca607' },
  { label: 'WARN', icon: 'exclamation-circle', fill: '#ff6a00' },
  { label: 'ERROR', icon: 'close-circle', fill: '#ea5154' },
];

export default memo(
  useInjectContext(({ tag, updateExecuteOutput, zoomIn, zoomOut }) => {
    const executeOutput = useSelector(
      state => state.temporaryvariable.executeOutput
    );

    const [openFlag, setOpenFlag] = useState(false);

    const [output, setOutput] = useState(executeOutput);
    const [filter, setFilter] = useState('');
    const [matchNum, setMatchNum] = useState(0);
    const [cursor, setCursor] = useState(0);
    const [newOutputTip, setNewOutputTip] = useState(false);
    const [selectedTags, setSelectedTags] = useState([
      'DEBUG',
      'INFO',
      'WARN',
      'ERROR',
    ]);
    const [stopScroll, setStopScroll] = useState(false);

    const getDownLoadPath = useGetDownloadPath();

    const getOutputDomHeight = () => {
      const outputDom = document.querySelector(
        '.dragger-editor-container-output'
      );
      return parseFloat(window.getComputedStyle(outputDom).height);
    };

    // 存储下方【输出/Debug】切换选项卡状态
    const [tabSwicth, setTabSwich] = useState('调试');

    const changeTabSwich = e => {
      //console.log(e)
      setTabSwich(e);
    };

    useEffect(() => {
      const handleAnchorMouseMove = useThrottle(e => {
        if (isMouseDown) {
          let offset = startOffset - e.pageY;
          startOffset = e.pageY;
          if (e.clientY <= 114) return;
          const outputDom = document.querySelector(
            '.dragger-editor-container-output'
          );
          const originHeight = getOutputDomHeight();
          // if (originHeight <= 74 && offset < 0) return;
          // originHeight = originHeight < 74 ? 74 : originHeight;
          const currentHeight = originHeight + offset;
          outputDom.style.height = currentHeight + 'px';
          if (currentHeight > 40) {
            setNewOutputTip(false);
            setOpenFlag(true);
          } else {
            setOpenFlag(false);
          }
        }
      }, 0);

      const handleMouseUp = () => {
        isMouseDown = false;
      };
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mousemove', handleAnchorMouseMove);
      return () => {
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('mousemove', handleAnchorMouseMove);
      };
    }, []);

    useEffect(() => {
      const handlePythonOutput = stdout => {
        allLogMessage.value += stdout;
        // 显示日志红点，表明有新日志
        const originHeight = getOutputDomHeight();
        if (originHeight <= 40 && !newOutputTip) setNewOutputTip(true);
        const newStdout = stdout.split('\n').filter(Boolean);
        // 记录对应的key值，保证在多条日志的情况下只对变更的日志进行修改
        const newStdoutArr = newStdout.map((item, index) => {
          return { value: item, key: index + originKey };
        });
        // 更新初始index值，防止key值重复
        originKey += newStdout.length;
        // 更新日志
        setOutput(output => {
          const result = [...output, ...newStdoutArr];
          // 日志显示最新的500条
          if (result.length > 500) {
            result.splice(0, result.length - 500);
          }
          return result;
        });
      };
      const handleClearOutput = () => {
        setOutput([]);
        originKey = 0;
        allLogMessage.value = '';
      };

      event.addListener(PYTHON_OUTPUT, handlePythonOutput);
      event.addListener(PYTHON_OUTPUT_CLEAR, handleClearOutput);
      return () => {
        event.addListener(PYTHON_OUTPUT, handlePythonOutput);
        event.removeListener(PYTHON_OUTPUT_CLEAR, handleClearOutput);
      };
    }, []);

    useEffect(() => {
      updateExecuteOutput(output);
      if (!stopScroll) {
        const lastOutput = document.querySelector('p.lastOutput');
        const content = document.querySelector(
          'pre.dragger-editor-container-output-content'
        );
        if (content && lastOutput) {
          // 顶部工具栏 40，可视区减去padding-bottom：155，最后一条输出的高度:42
          content.scrollTo(0, lastOutput.offsetTop - 40 - 155 + 42);
        }
      }
    }, [output]);

    const style =
      tag === 'graph'
        ? {
            width: 'calc(100% - 478px)',
            position: 'absolute',
          }
        : {
            width: '100%',
            position: 'relative',
          };

    const transformOutput = useMemo(() => {
      let selectedOutputList;
      if (selectedTags.length === 4) {
        selectedOutputList = output;
      } else {
        selectedOutputList = output.filter(item => {
          return selectedTags.some(tag => {
            let newTag = tag;
            if (newTag === 'WARN') {
              newTag = 'WARNING';
            }
            return item.value.includes(`[${newTag}]`);
          });
        });
      }

      let matchNumber = 0;

      const result = selectedOutputList.map((item, index) => {
        // if (filter && item.indexOf(filter) > -1) {
        let isLastOutput = false;
        if (index === selectedOutputList.length - 1) {
          isLastOutput = true;
        }

        if (filter && item.value.includes(filter)) {
          const className = `keyWordRow_${index}`;
          return (
            <p
              key={item.key}
              className={isLastOutput ? 'lastOutput' : ''}
              dangerouslySetInnerHTML={{
                __html: item.value.replace(
                  RegExp(filter, 'g'),
                  (match, index) => {
                    const classNameT =
                      matchNumber === cursor
                        ? className + ' keyWordRow_active'
                        : className;
                    matchNumber += 1;
                    return `<span class="${classNameT}" style="color:red">${match}</span>`;
                  }
                ),
              }}
            />
          );
        }
        return (
          <p key={item.key} className={isLastOutput ? 'lastOutput' : ''}>
            {item.value}
          </p>
        );
      });
      setMatchNum(matchNumber);
      return result;
    }, [output, filter, cursor, selectedTags]);

    const handleTriggerOpen = () => {
      // setOpenFlag(!openFlag);
      const basicHeight = '220px';
      const minHeight = '40px';
      const outputDom = document.querySelector(
        '.dragger-editor-container-output'
      );
      const originHeight = getOutputDomHeight();
      const isMinStatus = originHeight <= 40;
      // 添加动画效果
      outputDom.className =
        'dragger-editor-container-output dragger-editor-container-output-animateOpen';
      outputDom.style.height = isMinStatus ? basicHeight : minHeight;
      if (isMinStatus) {
        setOpenFlag(true);
      } else {
        setOpenFlag(false);
      }
      if (isMinStatus && newOutputTip) setNewOutputTip(false);
      setTimeout(() => {
        outputDom.className = 'dragger-editor-container-output';
      }, 300);
    };

    const handleScrollIntoView = () => {
      const activeDom = document.querySelector('span.keyWordRow_active');
      const container = document.querySelector(
        'div.dragger-editor-container-output'
      );
      const content = document.querySelector(
        'pre.dragger-editor-container-output-content'
      );
      if (content && activeDom) {
        content.scrollTo(0, activeDom.offsetTop - 40);
      }
    };

    const handleStopScroll = ({ key }) => {
      if (key === '2') setStopScroll(true);
      else if (key === '3') setStopScroll(false);
      else if (key === '1') {
        getDownLoadPath(
          filePath => {
            fs.writeFileSync(`${filePath}.txt`, allLogMessage.value);
          },
          'log',
          '',
          '',
          '导出日志'
        );
      }
    };

    const menu = (
      <Menu onClick={handleStopScroll}>
        <Menu.Item key="1" disabled={!allLogMessage.value}>
          导出日志
        </Menu.Item>
        <Menu.Item key="2" disabled={stopScroll}>
          停止滚动
        </Menu.Item>
        <Menu.Item key="3" disabled={!stopScroll}>
          恢复滚动
        </Menu.Item>
      </Menu>
    );

    // *新！ DEBUG功能
    // DEBUG服务是否启动
    const debug_switch = useSelector(state => state.debug.switch);
    const debug_pause = useSelector(state => state.debug.pasue);
    const debug_running = useSelector(state => state.debug.running);
    const debug_oneRunning = useSelector(state => state.debug.oneRunning);

    const debug_runningState = useSelector(state => state.debug.runningState);

    // 需要debug的数据
    const [debug_left_data, set_debug_left_data] = useState([]);
    const debug_dataStore = useSelector(state => state.debug.dataStore);
    const updater = useSelector(state => state.debug.updater);
    const [debug_lastPointer, set_debug_lastPointer] = useState(-1);

    const currentPagePosition = useSelector(
      state => state.temporaryvariable.currentPagePosition
    );
    const checkedGraphBlockId = useSelector(
      state => state.grapheditor.checkedGraphBlockId
    );

    useEffect(() => {
      event.addListener(DEBUG_SOURCECODE_INSERT, insertDebugInfo);
      event.addListener(DEBUG_RUN_STEP_BY_STEP, resetDebugIndex);
      return () => {
        event.removeListener(DEBUG_SOURCECODE_INSERT, insertDebugInfo);
        event.removeListener(DEBUG_RUN_STEP_BY_STEP, resetDebugIndex);
      };
    }, []);

    const resetDebugIndex = () => {
      setSelectedTreeNode([]);
      set_debug_lastPointer(-1);
    };

    const insertDebugInfo = infos => {
      console.log(`关键变量`, infos);
      // if (!infos.log.outputs) {
      //   return message.info('已完成变量发送');
      // }
      changeDebugInfos(DEBUG_SOURCECODE_INSERT, infos);
    };

    const [selectedTreeNode, setSelectedTreeNode] = useState([]);

    useEffect(() => {
      if (Object.keys(debug_dataStore).length === 0) return;
      console.log('有更新', debug_dataStore, getDebugIndex());

      if (currentPagePosition === 'editor') {
        if (debug_lastPointer < getDebugIndex().nowIndex)
          set_debug_lastPointer(getDebugIndex().nowIndex);
        set_debug_left_data(debug_dataStore);
      } else if (currentPagePosition === 'block') {
        if (debug_lastPointer < getDebugIndex().nowIndexCards)
          set_debug_lastPointer(getDebugIndex().nowIndexCards);
        try {
          const find = debug_dataStore.find(
            item => item.currentId === checkedGraphBlockId
          );
          // if (debug_dataStore.stepLog) {
          //   debug_dataStore.stepLog.forEach((log, index) => {
          //     find.cards[index].hasLog = log;
          //   });
          // }

          // console.log(`显示查询结果`, find, debug_dataStore);

          set_debug_left_data(find.cards);
        } catch (e) {
          console.log(e, '开发模式下避免问题');
        }
      }
    }, [debug_dataStore, updater]);

    const handleSendVariable = (var_name, key) => {
      if (!tempVariables.current.var_name) {
        return message.info('没有修改的变量');
      }
      if (var_name !== tempVariables.current.var_name) {
        return message.info(
          '改动的变量和发送按钮不匹配，请点击一次你要修改的变量值'
        );
      }

      let value = tempVariables.current.var_value;
      //
      value = value.trim();
      if (value.length === 0) {
        return message.info('不能发送空值');
      }

      if (!isNaN(Number(value))) {
        value = Number(value);
      }

      sendChangeVariable({
        method_name: key, //这个是修改的函数体名称
        var_data: [
          {
            var_name: tempVariables.current.var_name,
            var_value: value,
          },
        ],
      });
      setTimeout(() => {
        tempVariables.current.var_name = null;
        tempVariables.current.var_value = null;
      }, 200);
    };

    const tempVariables = useRef({
      var_name: null,
      var_value: null,
    });

    const signVariableChange = (value, var_name, var_value) => {
      console.clear();
      console.log(value, var_name, var_value);
      if (!value) {
        console.log(tempVariables.current);
        tempVariables.current.var_name = var_name;
        tempVariables.current.var_value = var_value;
        // tempVariables({
        //   var_name: var_name,
        //   var_value: var_value,
        // });
      } else {
        console.log(tempVariables.current);
        tempVariables.current.var_name = var_name;
        tempVariables.current.var_value = value.currentTarget.value;
        // setTempVariables({
        //   var_name: var_name,
        //   var_value: value.currentTarget.value,
        // });
      }
    };

    // 显示的变量详情
    const showDetails = () => {
      if (currentPagePosition === 'editor') {
        const index = parseInt(selectedTreeNode[0]);
        if (!debug_left_data[index]) return;
        if (!debug_left_data[index].hasLog) return;
        return Object.keys(debug_left_data[index].hasLog.var_datas).map(key => {
          console.log(debug_left_data[index].hasLog.var_datas);

          return (
            <TreeNode title={`作用域 ${key}`} defaultExpandAll={true}>
              {debug_left_data[index].hasLog.var_datas[key].map(variable => {
                return (
                  <TreeNode
                    title={`${variable.var_name} = ${variable.var_value}`}
                    key={uniqueId()}
                    defaultExpandAll={true}
                  >
                    <TreeNode
                      title={
                        <span>
                          <span className="outputPanel-normalTag">变量名</span>
                          {`${variable.var_name}`}
                        </span>
                      }
                      key={uniqueId()}
                      isLeaf
                    />
                    <TreeNode
                      title={
                        <span>
                          <span className="outputPanel-spTag">变量值</span>
                          <Input
                            type="text"
                            defaultValue={`${variable.var_value}`}
                            className="outputPanel-spTag-input"
                          ></Input>
                        </span>
                      }
                      key={uniqueId()}
                      defaultExpandAll={true}
                    >
                      <TreeNode
                        title={`查看更深的变量内容`}
                        key={uniqueId()}
                        isLeaf
                      />
                    </TreeNode>
                    <TreeNode
                      title={
                        <span>
                          <span className="outputPanel-normalTag">
                            变量类型
                          </span>
                          {`${variable.var_type}`}
                        </span>
                      }
                      key={uniqueId()}
                      isLeaf
                    />
                    <TreeNode
                      title={
                        <span>
                          <span className="outputPanel-normalTag">
                            变量长度
                          </span>
                          {`${variable.var_length}`}
                        </span>
                      }
                      key={uniqueId()}
                      isLeaf
                    />
                  </TreeNode>
                );
              })}
            </TreeNode>
          );
        });
      } else if (currentPagePosition === 'block') {
        console.log(
          `block状态下的右侧面板`,
          debug_left_data,
          debug_dataStore.stepLog
        );
        const index = parseInt(selectedTreeNode[0]);

        if (!debug_dataStore.stepLog) return;
        if (!debug_dataStore.stepLog[index]) return;
        if (!debug_dataStore.stepLog[index].var_datas) return;
        return Object.keys(debug_dataStore.stepLog[index].var_datas).map(
          key => {
            //console.log(debug_left_data[index].hasLog.var_datas);
            console.log(
              `WHAT???`,
              debug_dataStore.stepLog[index].var_datas,
              key
            );
            return (
              <TreeNode title={`作用域 ${key}`} defaultExpandAll={true}>
                {debug_dataStore.stepLog[index].var_datas[key].map(variable => {
                  return (
                    <TreeNode
                      title={`${variable.var_name} = ${variable.var_value}`}
                      key={uniqueId()}
                      defaultExpandAll={true}
                    >
                      <TreeNode
                        title={
                          <span>
                            <span className="outputPanel-normalTag">
                              变量名
                            </span>
                            {`${variable.var_name}`}
                          </span>
                        }
                        key={uniqueId()}
                        isLeaf
                      />
                      <TreeNode
                        title={
                          <span>
                            <span className="outputPanel-spTag">变量值</span>
                            <Input
                              type="text"
                              defaultValue={`${variable.var_value}`}
                              className="outputPanel-spTag-input"
                              onFocus={value => {
                                signVariableChange(
                                  null,
                                  variable.var_name,
                                  variable.var_value
                                );
                              }}
                              onChange={value => {
                                signVariableChange(
                                  value,
                                  variable.var_name,
                                  variable.var_value
                                );
                              }}
                            ></Input>
                            <span
                              className="outputPanel-spTag-pushBtn"
                              onClick={() => {
                                //alert('发送');
                                handleSendVariable(variable.var_name, key);
                              }}
                            >
                              <Icon type="export" />
                              修改变量
                            </span>
                          </span>
                        }
                        //title={`变量值 ${variable.var_value}`}
                        key={uniqueId()}
                        isLeaf
                      />
                      <TreeNode
                        title={
                          <span>
                            <span className="outputPanel-normalTag">
                              变量类型
                            </span>
                            {`${variable.var_type}`}
                          </span>
                        }
                        key={uniqueId()}
                        isLeaf
                      />
                      <TreeNode
                        title={
                          <span>
                            <span className="outputPanel-normalTag">
                              变量长度
                            </span>
                            {`${variable.var_length}`}
                          </span>
                        }
                        key={uniqueId()}
                        isLeaf
                      />
                    </TreeNode>
                  );
                })}
              </TreeNode>
            );
          }
        );
      }
    };

    return (
      <div
        className="dragger-editor-container-output"
        style={{ ...style }}
        onMouseDown={e => {
          isMouseDown = true;
          startOffset = e.pageY;
        }}
      >
        <div
          className="dragger-editor-container-output-title"
          onMouseDown={e => e.stopPropagation()}
          style={{ position: 'absolute', width: '100%' }}
        >
          {tag === 'graph' && <ZoomToolBar zoomIn={zoomIn} zoomOut={zoomOut} />}
          <span
            className={
              newOutputTip
                ? 'dragger-editor-container-output-title-tip normal-tip'
                : 'normal-tip'
            }
          >
            <div style={{ width: 180 }}>
              <Tabs
                className="outputTabs"
                defaultActiveKey={tabSwicth}
                onChange={changeTabSwich}
              >
                <TabPane
                  tab="输出"
                  key="输出"
                  style={{ widht: '20px !important' }}
                ></TabPane>
                <TabPane
                  tab="调试"
                  key="调试"
                  style={{ widht: '20px !important' }}
                ></TabPane>
              </Tabs>
            </div>
          </span>

          <div
            style={{ marginTop: -38 }}
            className="dragger-editor-container-output-anchor"
            onClick={handleTriggerOpen}
          >
            <Icon type={openFlag ? 'down' : 'up'} />
          </div>
          <Tags
            display={tabSwicth === '输出' ? 'inline' : 'none'}
            className="dragger-editor-container-output-tages"
            tagsData={tagsFromServer}
            selectedTags={selectedTags}
            handleChange={(checked, selectedTagLabel) => {
              if (checked) {
                setSelectedTags([...selectedTags, selectedTagLabel]);
              } else {
                setSelectedTags(
                  selectedTags.filter(item => selectedTagLabel !== item)
                );
              }
            }}
          />

          <div
            style={{
              marginTop: -38,
              display: tabSwicth === '调试' ? 'inline' : 'none',
            }}
            className="dragger-editor-container-output-tages"
          >
            {debug_switch === false ? (
              <DebugBtn
                labelText="启动Debug模式"
                iconType="play-circle"
                click={() => {
                  event.emit(DEBUG_OPEN_DEBUGSERVER);
                  event.emit(PYTHON_OUTPUT_CLEAR);
                }}
              />
            ) : (
              <span>
                <DebugBtn
                  labelText="关闭Debug服务"
                  iconType="stop"
                  click={() => {
                    event.emit(DEBUG_CLOSE_DEBUGSERVER);
                  }}
                />
              </span>
            )}

            {/** DEBUG服务器开启后，这些按钮才出现 */}
            {debug_switch === false ? (
              ''
            ) : (
              <span>
                {/** 单步调试时，上述所有的按钮都不能显示 */}
                {debug_oneRunning === true ? (
                  <DebugBtn
                    labelText="正在进行单步调试"
                    iconType="loading"
                    disabled={true}
                  />
                ) : (
                  <span>
                    {/** 没有操作时，可以进行按序调试 */}
                    {debug_running === false ? (
                      <DebugBtn
                        labelText="从头按序调试"
                        iconType="play-circle"
                        click={() => {
                          event.emit(DEBUG_RUN_STEP_BY_STEP);
                        }}
                      />
                    ) : (
                      <span>
                        {debug_pause === false ? (
                          <DebugBtn
                            labelText="暂停"
                            iconType="loading"
                            click={() => {
                              event.emit(DEBUG_SET_PAUSE);
                            }}
                          />
                        ) : (
                          <span>
                            <DebugBtn
                              labelText="继续"
                              iconType="play-circle"
                              click={() => {
                                event.emit(DEBUG_CONTINUE);
                              }}
                            />
                            <DebugBtn
                              labelText="下一步"
                              iconType="vertical-align-bottom"
                              click={() => {
                                event.emit(DEBUG_CONTINUE_ONESTEP_NEXT);
                              }}
                            />
                            <DebugBtn
                              labelText="重新生成代码"
                              iconType="issues-close"
                              click={() => {
                                resetDebugIndex();
                                event.emit(DEBUG_RESET_CODE);
                              }}
                            />
                          </span>
                        )}
                      </span>
                    )}
                  </span>
                )}
              </span>
            )}
          </div>
        </div>
        <div
          style={{
            marginTop: -3,
            display: tabSwicth === '输出' ? 'inline' : 'none',
          }}
          className="dragger-editor-container-output-search"
          onMouseDown={e => e.stopPropagation()}
        >
          <Search
            allowClear
            onChange={e => {
              if (e.target.value === '') {
                setCursor(0);
                setFilter('');
              }
            }}
            onSearch={value => {
              setCursor(0);
              setFilter(value);
            }}
            onKeyDown={e => {
              if (e.keyCode === 13) {
                setCursor(0);
                setFilter(e.target.value);
              }
            }}
          />
        </div>
        <Dropdown overlay={menu} trigger={['contextMenu']}>
          <div>
            <pre
              className="dragger-editor-container-output-content"
              onMouseDown={e => e.stopPropagation()}
              style={{
                marginTop: 38,
                display: tabSwicth === '输出' ? 'inline-block' : 'none',
                //background: 'rgba(244,252,250,1)',
              }}
            >
              {transformOutput}
            </pre>
            <div
              className="variablePanel"
              style={{
                display: tabSwicth === '调试' ? 'inline' : 'none',
                //background: 'rgba(244,252,250,1)',
              }}
            >
              <div className="left">
                <p
                  style={{
                    background: '#fff',
                    padding: '2px 0 0 33px',
                    color: '#aaa',
                  }}
                >
                  Debug范围
                </p>
                <DirectoryTree
                  multiple
                  defaultExpandAll
                  selectedKeys={selectedTreeNode}
                  onSelect={(selectedKeys, info) => {
                    if (selectedKeys.length != 1) return;
                    console.log(selectedKeys);
                    setSelectedTreeNode(selectedKeys);
                  }}
                  // onExpand={this.onExpand}
                >
                  {currentPagePosition === 'editor'
                    ? debug_left_data
                      ? debug_left_data.map((item, index) => {
                          return (
                            <TreeNode
                              title={item.titleName}
                              key={`${index}`}
                              isLeaf
                              disabled={item.hasLog ? false : true}
                            />
                          );
                        })
                      : ''
                    : ''}

                  {currentPagePosition === 'block'
                    ? debug_left_data
                      ? debug_left_data.map((item, index) => {
                          return (
                            <TreeNode
                              title={
                                item.userDesc ? item.userDesc : item.cmdName
                              }
                              key={`${index}`}
                              isLeaf
                              disabled={
                                debug_dataStore.stepLog
                                  ? debug_dataStore.stepLog[index]
                                    ? false
                                    : true
                                  : true
                              }
                            />
                          );
                        })
                      : ''
                    : ''}
                  {/**
                <TreeNode title="leaf 0-0" key="0-0-0" isLeaf />
                  <TreeNode title="parent 0" key="0-0">
                    <TreeNode title="leaf 0-0" key="0-0-0" isLeaf />
                  </TreeNode>
                  <TreeNode title="parent 1" key="0-1">
                    <TreeNode title="leaf 1-0" key="0-1-0" isLeaf />
                  </TreeNode>
                   */}
                </DirectoryTree>
              </div>
              <div className="right">
                <p
                  style={{
                    background: '#fff',
                    padding: '2px 0 0 33px',
                    color: '#aaa',
                  }}
                >
                  变量
                </p>
                <DirectoryTree
                  multiple
                  defaultExpandAll
                  // onSelect={this.onSelect}
                  // onExpand={this.onExpand}
                >
                  {selectedTreeNode.length === 1 ? showDetails() : ''}
                </DirectoryTree>
              </div>
            </div>
          </div>
        </Dropdown>
        <FilterToolbar
          visible={filter !== ''}
          matchNum={matchNum}
          filter={filter}
          handleNext={() => {
            setCursor(cursor => (cursor + 1 < matchNum ? cursor + 1 : cursor));
            setTimeout(() => {
              handleScrollIntoView();
            });
          }}
          handlePrev={() => {
            setCursor(cursor => (cursor - 1 >= 0 ? cursor - 1 : cursor));
            setTimeout(() => {
              handleScrollIntoView();
            });
          }}
        />
      </div>
    );
  })
);
