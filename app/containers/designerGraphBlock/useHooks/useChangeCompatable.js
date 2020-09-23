import { useEffect, useCallback } from 'react';
import useForceUpdate from 'react-hook-easier/lib/useForceUpdate';

export default (card, isTail) => {
  const [_, forceUpdate] = useForceUpdate();

  const borderColor = card.isCompatable ? 'red' : '#F2F2F2';
  return [
    id => {
      if (id === card.id) {
        if (card.isCompatable) {
          card.isCompatable = false;
          forceUpdate();
        }
      }
    },
    borderColor,
  ];
};
