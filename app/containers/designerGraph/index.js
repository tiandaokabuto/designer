import React, { Fragment } from 'react';
import { useInjectContext } from 'react-hook-easier/lib/useInjectContext';
import { Route } from 'react-router';

import GraphBlockHeader from '../common/GraphBlockHeader';
import DragEditorHeader from '../common/DragEditorHeader';
import DesignerGraphEdit from '../designerGraphEdit';
import DesignerGraphBlock from '../designerGraphBlock';
import routes from '../../constants/routes.json';

export default useInjectContext(({ history }) => {
  return (
    <Fragment>
      <GraphBlockHeader history={history} />
      <DragEditorHeader />
      <Route path={routes.DESIGNGRAPHEDIT} component={DesignerGraphEdit} />
      <Route path={routes.DesignerGraphBlock} component={DesignerGraphBlock} />
    </Fragment>
  );
});
