import React, { useEffect, useState, memo } from 'react';
import { useSelector } from 'react-redux';
import useThrottle from 'react-hook-easier/lib/useThrottle';
import { useInjectContext } from 'react-hook-easier/lib/useInjectContext';
import event, { PYTHON_OUTPUT } from '../eventCenter';

let isMouseDown = false;
let startOffset = 0;

export default memo(
  useInjectContext(({ tag, updateExecuteOutput }) => {
    const executeOutput = useSelector(
      state => state.temporaryvariable.executeOutput
    );

    const [output, setOutput] = useState(executeOutput);
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
    return (
      <div className="dragger-editor-container-output" style={{ ...style }}>
        <div
          className="dragger-editor-container-output-anchor"
          onMouseDown={e => ((isMouseDown = true), (startOffset = e.pageY))}
        />
        <div>
          输出:
          <br /> <pre style={{ display: 'inline' }}>{output}</pre>
        </div>
      </div>
    );
  })
);
