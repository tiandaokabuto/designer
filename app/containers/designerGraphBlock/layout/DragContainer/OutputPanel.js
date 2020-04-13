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
    const [filter, setFilter] = useState('a');
    const [selectedTags, setSelectedTags] = useState('DEBUG');

    useEffect(() => {
      const handleAnchorMouseMove = useThrottle(e => {
        if (isMouseDown) {
          let offset = startOffset - e.pageY;
          startOffset = e.pageY;
          if (e.clientY <= 114) return;
          const outputDom = document.querySelector(
            '.dragger-editor-container-output'
          );
          const originHeight = parseFloat(
            window.getComputedStyle(outputDom).height
          );
          // if (originHeight <= 74 && offset < 0) return;
          // originHeight = originHeight < 74 ? 74 : originHeight;
          outputDom.style.height = originHeight + offset + 'px';
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
    console.log(output.split('\n'));
    const transformOutput = useMemo(() => {
      const outputList = output.split('\n').filter(Boolean);
      return outputList.map(item => (
        <>
          <span
            dangerouslySetInnerHTML={{
              __html: filter
                ? item.replace(
                    filter,
                    match => `<span style="color:red">${match}</span>`
                  )
                : item,
            }}
          ></span>
          <br />
        </>
      ));
    }, [output, filter]);
    return (
      <div className="dragger-editor-container-output" style={{ ...style }}>
        <div className="dragger-editor-container-output-title">
          <span>输出:</span>
          <div
            className="dragger-editor-container-output-anchor"
            onMouseDown={e => {
              isMouseDown = true;
              startOffset = e.pageY;
            }}
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
        {/* <pre className="dragger-editor-container-output-content">{output}</pre> */}
        <pre className="dragger-editor-container-output-content">
          {transformOutput}
        </pre>
      </div>
    );
  })
);
