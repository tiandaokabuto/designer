import { useSelector } from 'react-redux';
import { saveAsXML } from '../../utils';

import store from '../../../../store';

export default () => {
  return () => {
    const {
      grapheditor: { mxgraphData },
    } = store.getState();
    saveAsXML(mxgraphData);
  };
};
