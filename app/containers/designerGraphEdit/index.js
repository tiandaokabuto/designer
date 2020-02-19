import React, { Fragment } from 'react';
import GGEditor, { Flow, RegisterNode } from 'gg-editor';

import GraphBlockHeader from '../common/GraphBlockHeader';
import DragEditorHeader from '../common/DragEditorHeader';
import FlowContextMenu from './layout/GraphContainer/components/EditorContextMenu/FlowContextMenu';

import GraphContainer from './layout/GraphContainer';
import GraphItem from './layout/GraphItem';
import GraphParamPanel from './layout/GraphParamPanel';
import Image from '../images/icon.jpg';
import ExecuteImage from '../images/execute.jpg';
import EditImage from '../images/edit.jpg';

import DesignerBody from './components/DesignerBody';

import './index.scss';
import { history } from '../../store/configureStore';

export default () => {
  return (
    <Fragment>
      {/* <div
        onClick={() => {
          history.push('/designerGraphBlock');
        }}
      >
        click
      </div> */}
      <GraphBlockHeader />
      <DragEditorHeader />

      <GGEditor className="designergraph editor">
        <GraphItem />
        <GraphContainer history={history} />
        <GraphParamPanel />
        <FlowContextMenu />
      </GGEditor>
    </Fragment>
  );
};
