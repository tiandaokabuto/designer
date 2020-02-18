import React, { Fragment } from 'react';
import GGEditor, { Flow, RegisterNode } from 'gg-editor';

import GraphBlockHeader from '../common/GraphBlockHeader';
import DragEditorHeader from '../common/DragEditorHeader';

import GraphContainer from './layout/GraphContainer';
import GraphItem from './layout/GraphItem';
import GraphParamPanel from './layout/GraphParamPanel';

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
      <GGEditor className="designergraph">
        <GraphItem />
        <GraphContainer />
        <GraphParamPanel />
      </GGEditor>
    </Fragment>
  );
};
