import React from 'react';
import GGEditor from 'gg-editor';

import GraphBlockHeader from '../common/GraphBlockHeader';
import DragEditorHeader from '../common/DragEditorHeader';
import FlowContextMenu from './layout/GraphContainer/components/EditorContextMenu/FlowContextMenu';
import ReuseCommand from './layout/GraphContainer/components/EditorContextMenu/ReuseCommand';

import GraphContainer from './layout/GraphContainer';
import GraphItem from './layout/GraphItem';
import GraphParamPanel from './layout/GraphParamPanel';
import Image from '../images/icon.jpg';
import ExecuteImage from '../images/execute.jpg';
import EditImage from '../images/edit.jpg';

import DesignerBody from './components/DesignerBody';

import { history } from '../../store/configureStore';

import './index.scss';

export default () => {
  return (
    <>
      <GraphBlockHeader history={history} />
      <DragEditorHeader type="process" />

      <GGEditor className="designergraph editor">
        <GraphItem />
        <GraphContainer history={history} />
        <GraphParamPanel />
        <FlowContextMenu />
        {/* <ReuseCommand /> */}
      </GGEditor>
    </>
  );
};
