import React, { useEffect, useState, memo } from 'react';
import useThrottle from 'react-hook-easier/lib/useThrottle';
import event, { PYTHON_OUTPUT,  } from '../eventCenter';

let isMouseDown = false;
let startOffset = 0;

export default memo(({ tag }) => {
  const [output, setOutput] = useState('');
  useEffect(() => {
    const handleAnchorMouseMove = useThrottle(e => {
      if (isMouseDown) {
        let offset = startOffset - e.pageY;
        startOffset = e.pageY;
        if (e.clientY <= 114) return;
        const outputDom = document.querySelector(
          '.dragger-editor-container-output'
        );
        let originHeight = parseFloat(
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
    const handleUpdataList = () => {

    }
    event.addListener(PYTHON_OUTPUT, handlePythonOutput);
    event.addListener('clear_output', handleClearOutput);
    return () => {
      event.removeListener(PYTHON_OUTPUT, handlePythonOutput);
      event.removeListener('clear_output', handleClearOutput);
    };
  }, []);

  const style =
    tag === 'graph'
      ? {
          position: 'fixed',
          width: '100%',
          bottom: '0px',
          overflow: 'auto',
          width: 'calc(100% - 478px)',
        }
      : {};
  return (
    <div className="dragger-editor-container-output" style={{ ...style }}>
      <div
        className="dragger-editor-container-output-anchor"
        onMouseDown={e => ((isMouseDown = true), (startOffset = e.pageY))}
      ></div>
      <div>
        输出:
        <br /> <pre>{output}</pre>
      </div>
    </div>
  );
});
