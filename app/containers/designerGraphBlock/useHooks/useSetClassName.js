import { useState, useCallback } from 'react';
import useDebounce from 'react-hook-easier/lib/useDebounce';

export default (delay = 80) => {
  const [className, setClassName] = useState('');

  const resetClassName = useCallback(
    useDebounce(() => {
      setClassName('');
    }, delay),
    [setClassName]
  );

  return [className, setClassName, resetClassName];
};
