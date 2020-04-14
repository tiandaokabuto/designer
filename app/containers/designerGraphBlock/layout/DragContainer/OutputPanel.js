import React, { useEffect, useState, memo, useMemo } from 'react';
import { useSelector } from 'react-redux';
import useThrottle from 'react-hook-easier/lib/useThrottle';
import { useInjectContext } from 'react-hook-easier/lib/useInjectContext';
import { Icon } from 'antd';

import event, { PYTHON_OUTPUT } from '../eventCenter';
import Tags from './components/Tags';

let isMouseDown = false;
let startOffset = 0;

const tagsFromServer = [
  { label: 'DEBUG', icon: 'warning', fill: '#0060bf' },
  { label: 'INFO', icon: 'info-circle', fill: '#dca607' },
  { label: 'WARN', icon: 'exclamation-circle', fill: '#ff6a00' },
  { label: 'ERROR', icon: 'close-circle', fill: '#ea5154' },
];

export default memo(
  useInjectContext(({ tag, updateExecuteOutput }) => {
    const executeOutput = useSelector(
      state => state.temporaryvariable.executeOutput
    );

    const [output, setOutput] = useState(executeOutput);
    const [filter, setFilter] = useState('');
    const [newOutputTip, setNewOutputTip] = useState(false);
    // const [filterOutput, setFilterOutput] = useState([]);
    const [selectedTags, setSelectedTags] = useState('DEBUG');

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
          };

    const transformOutput = useMemo(() => {
      const outputList = output.split('\n').filter(Boolean);
      const selectedOutputList = outputList.filter(
        item => item.indexOf(`[${selectedTags}]`) > -1
      );

      return selectedOutputList.map((item, index) => {
        if (filter && item.indexOf(filter) > -1) {
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
                setSelectedTags(selectedTagLabel);
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
      </div>
    );
  })
);
