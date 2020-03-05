import React, { useState, useEffect, memo, useMemo } from 'react';
import { Icon } from 'antd';
import { withRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';

import event, {
  PYTHON_EXECUTE,
} from '../../designerGraphBlock/layout/eventCenter';
import { usePublishProcessZip } from '../../designerGraphBlock/layout/useHooks';
import { usePublishProcess } from '../../designerGraphEdit/useHooks';
import IconFont from '../IconFont/index';
import usePersistentStorage from './useHooks/usePersistentStorage';

import NewProcess from './NewProcess';

import './index.scss';

const handleOperation = op => (...args) => {
  event.emit(op, ...args);
};

export default memo(
  withRouter(({ history, type }) => {
    const [visible, setVisible] = useState(undefined);
    const resetVisible = () => {
      setVisible(undefined);
    };

    const persistentStorage = usePersistentStorage();

    const handlePublishZip = usePublishProcessZip();

    const handlePublishProcess = usePublishProcess();

    const TOOLS_DESCRIPTION_FOR_CODEBLOCK = useMemo(
      () => [
        {
          description: '返回',
          type: 'rollback',
          IconFont: false,
          onClick: () => {
            event.emit('toggle');
            history.goBack();
          },
        },
        {
          description: '保存',
          type: 'save',
          onClick: () => {}, //handlePublishProcess,
        },
        {
          description: '运行',
          type: 'iconzhihang',
          IconFont: true,
          onClick: handleOperation(PYTHON_EXECUTE),
        },
        {
          description: '录制',
          type: 'iconrecordlight',
          IconFont: true,
        },
        {
          description: '发布',
          type: 'cloud-upload',
          onClick: () => {
            handlePublishProcess();
            handlePublishZip();
          },
        },
        {
          description: '导出',
          type: 'upload',
        },
        {
          description: '控制台',
          type: 'desktop',
        },
      ],
      []
    );

    const TOOLS_DESCRIPTION_FOR_PROCESS = useMemo(
      () => [
        {
          description: '新建',
          type: 'rollback',
          IconFont: false,
          onClick: () => {
            setVisible('newprocess');
          },
        },
        {
          description: '打开',
          type: 'save',
        },
        {
          description: '保存',
          type: 'iconzhihang',
          onClick: () => {
            // // 保存到本地
            // console.log('jjj', processTree, currentProject);
            // persistentStorage(processTree, currentProject);
            persistentStorage();
          },
          IconFont: true,
        },
        {
          description: '运行',
          type: 'iconrecordlight',
          IconFont: true,
        },
        {
          description: '发布',
          type: 'cloud-upload',
        },
        {
          description: '导出',
          type: 'upload',
        },
        {
          description: '控制台',
          type: 'desktop',
        },
      ],
      []
    );

    const [tools, setTools] = useState(
      type === 'process'
        ? TOOLS_DESCRIPTION_FOR_PROCESS
        : TOOLS_DESCRIPTION_FOR_CODEBLOCK
    );

    // useEffect(() => {
    //   const toggle = () => {
    //     // currentTools = !currentTools;
    //     setTools(tools => {
    //       return tools === TOOLS_DESCRIPTION_FOR_PROCESS
    //         ? TOOLS_DESCRIPTION_FOR_CODEBLOCK
    //         : TOOLS_DESCRIPTION_FOR_PROCESS;
    //     });
    //   };
    //   event.addListener('toggle', toggle);
    //   return () => {
    //     event.removeListener('toggle', toggle);
    //   };
    // }, []);
    return (
      <div className="drageditor-header">
        {tools.map((tool, index) => (
          <span key={index}>
            {tool.IconFont ? (
              <IconFont type={tool.type} onClick={tool.onClick || (() => {})} />
            ) : (
              <Icon type={tool.type} onClick={tool.onClick || (() => {})} />
            )}
            {tool.description}
          </span>
        ))}
        {visible === 'newprocess' && <NewProcess resetVisible={resetVisible} />}
      </div>
    );
  })
);
