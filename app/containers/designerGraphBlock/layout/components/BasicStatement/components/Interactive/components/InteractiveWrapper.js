import React from 'react';

import { useInteractiveDropTarget } from '../useHooks';

export default ({ children }) => {
  const [{ isOver }, ref, drop] = useInteractiveDropTarget();
  drop(ref);
  return (
    <div
      className={`interactive-wrapper ${
        isOver ? 'interactive-wrapper__over' : ''
      }`}
      ref={ref}
    >
      {children}
    </div>
  );
};
