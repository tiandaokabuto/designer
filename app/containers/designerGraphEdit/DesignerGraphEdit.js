import React, { Fragment } from 'react';

import DesignerBody from './components/DesignerBody';
import GraphBlockHeader from '../common/GraphBlockHeader';
import DragEditorHeader from '../common/DragEditorHeader';

import './DesignerGraphEdit.scss';
import { history } from '../../store/configureStore';

export default () => {
  return (
    <Fragment>
      <GraphBlockHeader />
      <DragEditorHeader />
      {/* <div className="designergraph">
        <DesignerBody />
      </div> */}
      <div
        onClick={() => {
          history.push('/designerGraphBlock');
        }}
      >
        click
      </div>
    </Fragment>
  );
};
