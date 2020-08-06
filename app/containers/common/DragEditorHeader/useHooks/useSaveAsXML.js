import { useSelector } from 'react-redux';
import { saveAsXML } from '_utils/utils';

import store from '../../../../store';

export default () => {
  return () => {
    const {
      grapheditor: { mxgraphData },
    } = store.getState();
    saveAsXML(mxgraphData);
  };
};
