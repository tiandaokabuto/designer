import React, { useLayoutEffect, useState, Fragment, useCallback } from 'react';
import useResize from 'react-hook-easier/lib/useResize';
import useUpdateEffect from 'react-hook-easier/lib/useUpdateEffect';
import debounce from 'lodash/debounce';

import DesignerEditor from './DesignerEditor';
import DesignerMenu from './DesignerMenu';
import { Spin } from 'antd';

let count = 0; // reRender times

export default React.memo(() => {
  const [state, elementRef] = useResize();
  const [loading, setLoading] = useState(false);

  const recover = useCallback(
    debounce(() => {
      setLoading(false);
    }, 333),
    []
  );

  useUpdateEffect(() => {
    count++;
    if (count >= 2) {
      if (!loading) {
        setLoading(true);
        recover();
      } else {
        recover();
      }
    }
  }, [state.width, state.height, recover]);

  return (
    <div className="designergraph-body" ref={elementRef}>
      {loading ? (
        <Spin spinning={true} tip="数据加载中..." className="editor-spin" />
      ) : (
        <Fragment>
          <DesignerEditor />
          <DesignerMenu />
        </Fragment>
      )}
    </div>
  );
});
