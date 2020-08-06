import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

export default (id, card) => {
  const checkedId = useSelector((state) => state.blockcode.checkedId);
  const [backgroundColor, setBackgroundColor] = useState('#fff');
  const [isIgnore, setIsIgnore] = useState(card.ignore);
  const prevBackgroundColor = useRef('#fff');
  useEffect(() => {
    if (checkedId && checkedId.includes(id)) {
      if (backgroundColor === '#fff') {
        prevBackgroundColor.current = '#DAF2ED';
      }
    }
    if (!checkedId || !checkedId.includes(id)) {
      if (backgroundColor === '#DAF2ED') {
        prevBackgroundColor.current = '#fff';
      }
    }
    if (isIgnore) {
      setBackgroundColor('#eee');
    } else {
      setBackgroundColor(prevBackgroundColor.current);
    }
  }, [checkedId, id, backgroundColor, isIgnore]);

  useEffect(() => {
    setIsIgnore(card.ignore);
  }, [card.ignore]);
  return [backgroundColor, isIgnore, () => setIsIgnore((ignore) => !ignore)];
};
