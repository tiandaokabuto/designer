import React from 'react';

import { useInteractiveDropTarget } from '../useHooks';

export default ({ children }) => {
  const [collectProps, ref, drop] = useInteractiveDropTarget();
  drop(ref);
  return (
    <div className="interactive-wrapper" ref={ref}>
      {children}
    </div>
  );
};
