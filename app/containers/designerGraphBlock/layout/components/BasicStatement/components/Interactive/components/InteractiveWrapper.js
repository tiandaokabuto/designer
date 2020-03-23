import React from 'react';

import { useInteractiveDropTarget } from '../useHooks';

export default () => {
  const [collectProps, ref, drop] = useInteractiveDropTarget();
  drop(ref);
  return (
    <div
      className="interactive-wrapper"
      ref={ref}
      style={{
        background: 'gray',
      }}
    >
      wrapper
    </div>
  );
};
