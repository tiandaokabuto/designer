import React from 'react';

import DesignerBody from './components/DesignerBody';
import GraphBlockHeader from '../common/GraphBlockHeader';
import DragEditorHeader from '../common/DragEditorHeader';

import './DesignerGraphEdit.scss';
import { history } from '../../store/configureStore';

export default () => {
  return (
    <div className="designergraph">
      <GraphBlockHeader />
      <DragEditorHeader />
      <DesignerBody />
    </div>
  );
};
