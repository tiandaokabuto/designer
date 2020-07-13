import React, { useEffect, useState, memo, useMemo } from 'react';
import { useSelector } from 'react-redux';
import useThrottle from 'react-hook-easier/lib/useThrottle';
import { useInjectContext } from 'react-hook-easier/lib/useInjectContext';
import { Icon, Input, Dropdown, Menu } from 'antd';

import event, { PYTHON_OUTPUT } from '../eventCenter';
import FilterToolbar from './components/FilterToolbar';
import Tags from './components/Tags';
import ZoomToolBar from './components/ZoomToolBar';
import useGetDownloadPath from '../../../common/DragEditorHeader/useHooks/useGetDownloadPath';

const fs = require('fs');

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
      return () => {
        event.removeListener(PYTHON_OUTPUT, handlePythonOutput);
        event.removeListener('clear_output', handleClearOutput);
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
        >
          {tag === 'graph' && <ZoomToolBar zoomIn={zoomIn} zoomOut={zoomOut} />}
          <span
            className={
              newOutputTip
                ? 'dragger-editor-container-output-title-tip normal-tip'
                : 'normal-tip'
            }
          >
            输出
          </span>

          <div
            className="dragger-editor-container-output-anchor"
            onClick={handleTriggerOpen}
          >
            <Icon type={openFlag ? 'down' : 'up'} />
          </div>
          <Tags
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
        </div>
        <div
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
          <pre
            className="dragger-editor-container-output-content"
            onMouseDown={e => e.stopPropagation()}
            style={{
              background: 'rgba(244,252,250,1)',
            }}
          >
            {transformOutput}
          </pre>
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
