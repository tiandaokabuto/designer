import React from 'react';

import { useInteractiveDragSource } from '../useHooks';

export default ({ item }) => {
  const [drag, dragImage] = useInteractiveDragSource({ item });
  return (
    <div className="interactive-control" ref={drag}>
      控件 ---
    </div>
  );
};
