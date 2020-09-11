import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

export default (id, card, statementType) => {
  const checkedId = useSelector(state => state.blockcode.checkedId);
  const [backgroundColor, setBackgroundColor] = useState('#fff');
  const [border, setBorder] = useState('1px solid black');
  const [mainHeadBackgroundColor, setMainHeadBackgroundColor] = useState(
    '#DAF2ED'
  );
  const [othersHeadBackgroundColor, setOthersHeadBackgroundColor] = useState(
    '#EFFAE1'
  );

  const [isIgnore, setIsIgnore] = useState(card.ignore);
  const prevBackgroundColor = useRef('#fff');
  const preBorder = useRef('1px solid #F2F2F2');

  const preMainHeadBackgroundColor = useRef('#DAF2ED');
  const preOthersHeadBackgroundColor = useRef('#EFFAE1');
  useEffect(() => {
    if (checkedId && checkedId.includes(id)) {
      if (backgroundColor === '#fff') {
        // 未选中
        if (statementType === 'basic') {
          prevBackgroundColor.current = '#DAF2ED';
        } else {
          prevBackgroundColor.current = '#F2FAF7';
          preMainHeadBackgroundColor.current = '#32A67F';
          preOthersHeadBackgroundColor.current = '#AACC7A';
        }

        preBorder.current = '1px solid #32A67F';
      }
    }
    if (!checkedId || !checkedId.includes(id)) {
      if (backgroundColor === '#DAF2ED' || backgroundColor === '#F2FAF7') {
        // 选中
        prevBackgroundColor.current = '#fff';
        if (statementType === 'basic') {
          preBorder.current = '1px solid #F2F2F2';
        } else {
          preMainHeadBackgroundColor.current = '#DAF2ED';
          preOthersHeadBackgroundColor.current = '#EFFAE1';
          preBorder.current = 'none';
        }
      }
    }

    if (isIgnore) {
      setBackgroundColor('#eee');
      setBorder('1px solid #F2F2F2');
    } else {
      setBackgroundColor(prevBackgroundColor.current);
      setBorder(preBorder.current);
      setMainHeadBackgroundColor(preMainHeadBackgroundColor.current);
      setOthersHeadBackgroundColor(preOthersHeadBackgroundColor.current);
    }
  }, [checkedId, id, backgroundColor, isIgnore]);

  useEffect(() => {
    setIsIgnore(card.ignore);
  }, [card.ignore]);
  return [
    backgroundColor,
    border,
    mainHeadBackgroundColor,
    othersHeadBackgroundColor,
    isIgnore,
    () => setIsIgnore(ignore => !ignore),
  ];
};
