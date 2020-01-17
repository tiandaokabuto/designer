import React from 'react';

import DesignerHeader from './components/DesignerHeader/DesignerHeader';
import DesignerBody from './components/DesignerBody';

import './DesignerGraphEdit.scss';
import { history } from '../../store/configureStore';

export default () => {
  return (
    <div className="designergraph">
      <DesignerHeader />
      <DesignerBody />
    </div>
  );
};
