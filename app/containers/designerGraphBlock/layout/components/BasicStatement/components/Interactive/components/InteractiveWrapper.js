import React from 'react';
import { useInjectContext } from 'react-hook-easier/lib/useInjectContext';

import { useInteractiveDropTarget } from '../useHooks';

export default ({ children }) => {
  const [{ isOver }, ref, drop] = useInteractiveDropTarget({});
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
