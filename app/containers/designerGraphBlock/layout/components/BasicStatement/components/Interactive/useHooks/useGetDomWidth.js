import { useState, useEffect, useRef } from 'react';
import useThrottle from 'react-hook-easier/lib/useThrottle';

export default () => {
  const infoRef = useRef(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!infoRef.current) return;
    setWidth(infoRef.current.clientWidth);
    const handleWindowResize = useThrottle(() => {
      if (!infoRef.current) return;
      setWidth(infoRef.current.clientWidth);
    }, 333);
    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [infoRef]);
  return [infoRef, width];
};
