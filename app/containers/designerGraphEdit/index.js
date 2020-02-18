import React, { Fragment } from 'react';

import GraphBlockHeader from '../common/GraphBlockHeader';
import DragEditorHeader from '../common/DragEditorHeader';

import GraphContainer from './layout/GraphContainer';
import GraphItem from './layout/GraphItem';
import GraphParamPanel from './layout/GraphParamPanel';

import './index.scss';
import { history } from '../../store/configureStore';

export default () => {
  history.push('/designerGraphBlock');
  return (
    <Fragment>
      <GraphBlockHeader />
      <DragEditorHeader />
      <div className="designergraph">
        <GraphItem />
        <GraphContainer />
        <GraphParamPanel />
      </div>
    </Fragment>
  );
};
