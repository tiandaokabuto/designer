import React, { useEffect, useState, memo, useMemo } from 'react';
import { useSelector } from 'react-redux';
import useThrottle from 'react-hook-easier/lib/useThrottle';
import { useInjectContext } from 'react-hook-easier/lib/useInjectContext';
import { Icon, Input } from 'antd';

import event, { PYTHON_OUTPUT } from '../eventCenter';
import FilterToolbar from './components/FilterToolbar';
import Tags from './components/Tags';

let isMouseDown = false;
let startOffset = 0;

const { Search } = Input;

const tagsFromServer = [
  { label: 'DEBUG', icon: 'warning', fill: '#0060bf' },
  { label: 'INFO', icon: 'info-circle', fill: '#dca607' },
  { label: 'WARN', icon: 'exclamation-circle', fill: '#ff6a00' },
  { label: 'ERROR', icon: 'close-circle', fill: '#ea5154' },
];

const fakeData = `[INFO] 2020-04-15 13:47:12,404 Browser.py [line:50] openBrowser 正在打开浏览器...

[ERROR] 2020-04-15 13:47:17,206 Browser.py [line:68] openBrowser 无法打开浏览器

[ERROR] 2020-04-15 13:47:17,206 Browser.py [line:69] openBrowser Message: session not created: This version of ChromeDriver only supports Chrome version 79`;

export default memo(
  useInjectContext(({ tag, updateExecuteOutput }) => {
    const executeOutput = useSelector(
      state => state.temporaryvariable.executeOutput
    );

    const [output, setOutput] = useState(fakeData);
    const [filter, setFilter] = useState('');
    const [newOutputTip, setNewOutputTip] = useState(false);
    const [selectedTags, setSelectedTags] = useState([
      'DEBUG',
      'INFO',
      'WARN',
      'ERROR',
    ]);

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
          if (currentHeight > 40) setNewOutputTip(false);
        }
      }, 0);

      const handleMouseUp = () => {
        isMouseDown = false;
      };
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mousemove', handleAnchorMouseMove);
    }, []);

    useEffect(() => {
      const handlePythonOutput = stdout => {
        const originHeight = getOutputDomHeight();
        if (originHeight <= 40 && !newOutputTip) setNewOutputTip(true);
        setOutput(output => output + '\n' + stdout);
      };
      const handleClearOutput = () => {
        setOutput('');
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
      const outputList = output.split('\n').filter(Boolean);
      const selectedOutputList = outputList.filter(item => {
        return selectedTags.some(tag => item.includes(`[${tag}]`));
        // for (let i = 0; i < selectedTags.length; i += 1) {
        //   const selectedTag = selectedTags[i];
        //   if (item.indexOf(`[${selectedTag}]`) > -1) return true;
        // }
        // return false;
      });

      return selectedOutputList.map((item, index) => {
        // if (filter && item.indexOf(filter) > -1) {
        if (filter && item.includes(filter)) {
          const className = `keyWordRow${index}`;

          return (
            <p
              key={item}
              dangerouslySetInnerHTML={{
                __html: item.replace(
                  RegExp(filter, 'g'),
                  (match, index) =>
                    `<span class="${className}_${index}" style="color:red">${match}</span>`
                ),
              }}
            />
          );
        }
        return <p key={item}>{item}</p>;
      });
    }, [output, filter, selectedTags]);

    const handleTriggerOpen = () => {
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
      if (isMinStatus && newOutputTip) setNewOutputTip(false);
      setTimeout(() => {
        outputDom.className = 'dragger-editor-container-output';
      }, 300);
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
        >
          <span
            className={
              newOutputTip ? 'dragger-editor-container-output-title-tip' : ''
            }
          >
            输出
          </span>

          <div
            className="dragger-editor-container-output-anchor"
            onClick={handleTriggerOpen}
          >
            <Icon type="caret-up" style={{ marginBottom: '-3px' }} />
            <Icon type="caret-down" />
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
        <div className="dragger-editor-container-output-search">
          <Search
            allowClear
            onChange={e => {
              if (e.target.value === '') {
                setFilter('');
              }
            }}
            onSearch={value => {
              setFilter(value);
            }}
            onKeyDown={e => {
              if (e.keyCode === 13) {
                setFilter(e.target.value);
              }
            }}
          />
        </div>
        <pre
          className="dragger-editor-container-output-content"
          onMouseDown={e => e.stopPropagation()}
        >
          {transformOutput}
        </pre>
        <FilterToolbar visible={filter !== ''} />
      </div>
    );
  })
);
