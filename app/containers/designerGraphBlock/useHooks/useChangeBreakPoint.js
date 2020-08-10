import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

export default (id, card) => {
  const [isBreakPoint, setIsBreakPoint] = useState(card.breakPoint);

  // useEffect(() => {
  //   // card.breakPoint = !card.breakPoint;
  // }, [id, card]);


  useEffect(() => {
    //if(isBreakPoint) return;
    //card.breakPoint = !card.breakPoint;
    setIsBreakPoint(card.breakPoint);
  }, [card.breakPoint]);
  return [isBreakPoint, () => setIsBreakPoint(isBreakPoint => !isBreakPoint)];
};
