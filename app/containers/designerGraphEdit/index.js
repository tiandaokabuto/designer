import React, { useEffect, useState } from 'react';
import GGEditor from 'gg-editor';
import { Button } from 'antd';

import GraphBlockHeader from '../common/GraphBlockHeader';
import DragEditorHeader from '../common/DragEditorHeader';
import FlowContextMenu from './layout/GraphContainer/components/EditorContextMenu/FlowContextMenu';
import ReuseCommand from './layout/GraphContainer/components/EditorContextMenu/ReuseCommand';

import GraphContainer from './layout/GraphContainer';
import GraphItem from './layout/GraphItem';
import GraphParamPanel from './layout/GraphParamPanel';
import Loading from '../../containers/images/loading.gif';

import DesignerBody from './components/DesignerBody';

import { history } from '../../store/configureStore';

import './index.scss';

export default () => {
  const [showLoadingLayer, setShowLoadingLayer] = useState(false);
  useEffect(() => {
    window.getSelection().removeAllRanges();
  }, []);

  return (
    <>
      {/* <GraphBlockHeader history={history} />
      <DragEditorHeader type="process" /> */}
      <div
        className={
          showLoadingLayer ? 'loadingLayer showLoadingLayer' : 'loadingLayer'
        }
        // className="loadingLayer showLoadingLayer"
      >
        <div className="loadingContent">
          <img src={Loading} alt="loading" />
          <p>正在加载流程...</p>
        </div>
      </div>
      <GGEditor className="designergraph editor">
        <GraphItem setShowLoadingLayer={setShowLoadingLayer} />
        <GraphContainer history={history} />
        <GraphParamPanel />
        <FlowContextMenu />
        {/* <ReuseCommand /> */}
      </GGEditor>
    </>
  );
};
