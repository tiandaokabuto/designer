import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

export default id => {
  const checkedId = useSelector(state => state.blockcode.checkedId);
  const [backgroundColor, setBackgroundColor] = useState('#fff');
  useEffect(() => {
    if (checkedId && checkedId === id) {
      if (backgroundColor === '#fff') {
        setBackgroundColor('#DAF2ED');
      }
    }
    if (!checkedId || checkedId !== id) {
      if (backgroundColor === '#DAF2ED') {
        setBackgroundColor('#fff');
      }
    }
  }, [checkedId, id, backgroundColor]);
  return [backgroundColor];
};
