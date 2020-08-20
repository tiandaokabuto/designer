import React, { useEffect, useState, memo, useMemo } from 'react';
import { useSelector } from 'react-redux';
import useThrottle from 'react-hook-easier/lib/useThrottle';
import { useInjectContext } from 'react-hook-easier/lib/useInjectContext';
import { Icon, Input, Dropdown, Menu, Tag, Tabs, Tree, message } from 'antd';

import './temp.less';

import FilterToolbar from './FilterToolbar';
import Tags from './Tags';
import ZoomToolBar from './ZoomToolBar';
import useGetDownloadPath from '../../common/DragEditorHeader/useHooks/useGetDownloadPath';

import {
  handleDebugBlockAllRun,
  handleDebugCardsAllRun,
} from '../../designerGraphEdit/RPAcore';

import DebugBtn from './DebugBtn/DebugBtn';

import './OutputPanel.scss';

// liuqi
import { useTransformProcessToPython } from '../../designerGraphEdit/useHooks';
import event, {
  PYTHON_OUTPUT,
  PYTHOH_DEBUG_BLOCK_ALL_RUN,
  PYTHOH_DEBUG_CARDS_ALL_RUN,
  PYTHOH_DEBUG_SERVER_START,
  PYTHOH_DEBUG_BLOCK_ALL_RUN_END,
  PYTHOH_DEBUG_BLOCK_ALL_RUN_PAUSE,
} from '../../eventCenter';
import {
  runDebugServer,
  runAllStepByStepAuto,
  killTask,
} from '../../../utils/DebugUtils/runDebugServer';
import {
  getTempCenter,
  setPause,
  clearPause,
} from '../../designerGraphEdit/RPAcore';

// liuqi-new
import { changeDebugInfos } from '../../reduxActions';
import {
  DEBUG_OPEN_DEBUGSERVER,
  DEBUG_CLOSE_DEBUGSERVER,
  DEBUG_RUN_BLOCK_ALL_RUN
} from '../../../constants/actions/debugInfos';

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
    const [tabSwicth, setTabSwich] = useState('Debug');

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
      event.addListener('clear_output', handleClearOutput);

      // 第一层的全体调试
      event.addListener(PYTHOH_DEBUG_BLOCK_ALL_RUN, blockAllNext);
      // 第二层的全体调试
      event.addListener(PYTHOH_DEBUG_CARDS_ALL_RUN, cardsAllNext);

      return () => {
        event.removeListener(PYTHON_OUTPUT, handlePythonOutput);
        event.removeListener('clear_output', handleClearOutput);
        event.removeListener(PYTHOH_DEBUG_BLOCK_ALL_RUN, blockAllNext);
        event.removeListener(PYTHOH_DEBUG_CARDS_ALL_RUN, cardsAllNext);
      };
    }, []);

    const checkedGraphBlockId = useSelector(
      state => state.grapheditor.checkedGraphBlockId
    );

    // 处理第一层调试
    const blockAllNext = () => {
      handleDebugBlockAllRun();
    };
    // 处理第二层调试
    const cardsAllNext = () => {
      handleDebugCardsAllRun(checkedGraphBlockId);
    };

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
    const debug_pause = useSelector(state => state.debug.pause);
    const debug_running = useSelector(state => state.debug.running);
    const debug_oneRunning = useSelector(state => state.debug.oneRunning);
    const debug_runningState = useSelector(state => state.debug.runningState);

    const currentPagePosition = useSelector(
      state => state.temporaryvariable.currentPagePosition
    );

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
                  tab="Debug"
                  key="Debug"
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
              display: tabSwicth === 'Debug' ? 'inline' : 'none',
            }}
            className="dragger-editor-container-output-tages"
          >
            {debug_switch === false ? (
              <DebugBtn
                labelText="启动Debug模式"
                iconType="play-circle"
                click={() => event.emit(DEBUG_OPEN_DEBUGSERVER)}
              />
            ) : (
              <span>
                <DebugBtn
                  labelText="关闭Debug服务"
                  iconType="stop"
                  click={() => event.emit(DEBUG_CLOSE_DEBUGSERVER)}
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
                    iconType="stop"
                    disabled={true}
                  />
                ) : (
                  <span>
                    {/** 没有操作时，可以进行按序调试 */}
                    {debug_running === false ? (
                      <DebugBtn labelText="按序调试" iconType="play-circle" click={()=>{
                        if (currentPagePosition === 'editor') {
                          console.log(DEBUG_RUN_BLOCK_ALL_RUN);
                          event.emit(DEBUG_RUN_BLOCK_ALL_RUN);

                          //event.emit(DEBUG_RUN_BLOCK_ALL_RUN);
                          //localStorage.setItem('running_mode', 'blockAll_running');
                        } else if (currentPagePosition === 'block') {
                          // console.log(DEBUG_RUN_BLOCK_ALL_RUN);
                          // event.emit(DEBUG_RUN_BLOCK_ALL_RUN);


                          // setPauseState({ running: true, pause: false });
                          // console.log(transformProcessToPython());
                          // console.log(getTempCenter());
                          // localStorage.setItem('running_mode', 'cardsAll_running');
                          // event.emit(PYTHOH_DEBUG_CARDS_ALL_RUN);
                        }
                      }}/>
                    ) : (
                      <span>
                        {debug_pause === true ? (
                          <DebugBtn labelText="暂停" iconType="pause-circle" />
                        ) : (
                          <span>
                            <DebugBtn labelText="继续" iconType="play-circle" />
                            <DebugBtn
                              labelText="重新生成代码"
                              iconType="issues-close"
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
                display: tabSwicth === 'Debug' ? 'inline' : 'none',
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
                  // onSelect={this.onSelect}
                  // onExpand={this.onExpand}
                >
                  <TreeNode title="第二步" key="1" isLeaf />
                  <TreeNode title="第一步" key="2" isLeaf />
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
                  <TreeNode title="parent 0" key="0-0">
                    <TreeNode title="leaf 0-0" key="0-0-0" isLeaf />
                  </TreeNode>
                  <TreeNode title="parent 1" key="0-1">
                    <TreeNode title="leaf 1-0" key="0-1-0" isLeaf />
                    <TreeNode title="leaf 1-0" key="0-1-1" isLeaf />
                  </TreeNode>
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
