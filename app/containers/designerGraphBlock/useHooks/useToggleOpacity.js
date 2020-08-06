import { useEffect, useState } from 'react';

import { PLACEHOLDER_STATEMENT } from '../constants/statementTypes';

export default ({ isDraggingNode, id, index }) => {
  const [opacity, setOpacity] = useState(1);
  useEffect(() => {
    if (isDraggingNode.id !== id) {
      setOpacity(1);
    } else {
      setTimeout(() => {
        index !== PLACEHOLDER_STATEMENT && setOpacity(0);
      }, 0);
    }
  }, [isDraggingNode, id, index]);
  return opacity;
};
