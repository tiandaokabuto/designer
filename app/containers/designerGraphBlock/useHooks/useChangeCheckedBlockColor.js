import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

const DEEP_COMMENT_COLOR = '#EEEEEE'; // 注释颜色---深色
const LIGHT_COMMENT_COLOR = '#F2F2F2'; // 注释颜色---浅色

const BASIC_COLOR = '#FFFFFF'; // 原子能力的默认背景色
const BASIC_FOCUS_COLOR = '#DAF2ED'; // 普通原子能力背景色---选中

const SPECIAL_HEAD_COLOR = '#DAF2ED'; // 可嵌套流程块的第一个头部颜色---未选中
const SPECIAL_HEAD_FOCUS_COLOR = '#32A67F'; // 可嵌套流程块的第一个头部颜色---选中
const SPECIAL_OTHER_HEAD_COLOR = '#EFFAE1'; // 可嵌套流程块的其他头部颜色---未选种
const SPECIAL_OTHER_HEAD_FOCUS_COLOR = '#AACC7A'; // 可嵌套流程块的其他头部颜色---选中
const SPECIAL_FOCUS_COLOR = '#F2FAF7'; // 可嵌套流程块选中之后内容区的背景颜色

const DEBUG_COLOR = '#FFF2F2'; // debug模式的背景颜色

const BASIC_BORDER = '#F2F2F2'; // 普通原子能力的边框颜色
const BASIC_FOCUS_BORDER = '#32A67F'; // 普通原子能力选中的边框
const SPECIAL_BORDER = '#DAF2ED'; // 特殊原子能力的边框颜色
const SPECIAL_FOCUS_BORDER = '#32A67F'; // 特殊原子能力的选中的边框颜色

export default (id, card, statementType) => {
  const checkedId = useSelector(state => state.blockcode.checkedId);
  const [backgroundColor, setBackgroundColor] = useState(BASIC_COLOR);
  const [border, setBorder] = useState(`1px solid ${BASIC_BORDER}`);
  const [mainHeadBackgroundColor, setMainHeadBackgroundColor] = useState(
    SPECIAL_HEAD_COLOR
  );
  const [othersHeadBackgroundColor, setOthersHeadBackgroundColor] = useState(
    SPECIAL_OTHER_HEAD_COLOR
  );

  const [isIgnore, setIsIgnore] = useState(card.ignore);
  const [isBreak, setIsBreak] = useState(card.breakPoint);
  const prevBackgroundColor = useRef(BASIC_COLOR);
  const preBorder = useRef(`1px solid ${BASIC_BORDER}`);

  const preMainHeadBackgroundColor = useRef(SPECIAL_HEAD_COLOR);
  const preOthersHeadBackgroundColor = useRef(SPECIAL_OTHER_HEAD_COLOR);
  useEffect(() => {
    // 当前原子能力是被选中的
    if (checkedId && checkedId.includes(id)) {
      // if (checkedId.includes(id)) {
      if (backgroundColor === BASIC_COLOR) {
        if (statementType === 'basic') {
          prevBackgroundColor.current = BASIC_FOCUS_COLOR;
          preBorder.current = `1px solid ${BASIC_FOCUS_BORDER}`;
        } else {
          prevBackgroundColor.current = SPECIAL_FOCUS_COLOR;
          preMainHeadBackgroundColor.current = SPECIAL_HEAD_FOCUS_COLOR;
          preOthersHeadBackgroundColor.current = SPECIAL_OTHER_HEAD_FOCUS_COLOR;
          preBorder.current = `1px solid ${SPECIAL_FOCUS_BORDER}`;
        }
      } else if (backgroundColor === LIGHT_COMMENT_COLOR) {
        preBorder.current = `1px solid ${BASIC_FOCUS_BORDER}`;
      } else if (backgroundColor === DEEP_COMMENT_COLOR) {
        preBorder.current = `1px solid ${SPECIAL_FOCUS_BORDER}`;
      } else if (backgroundColor === DEBUG_COLOR) {
        preBorder.current = `1px solid ${BASIC_FOCUS_BORDER}`;
      }
    }
    // 当前原子能力不被选中
    if (!checkedId || !checkedId.includes(id)) {
      // if (!checkedId.includes(id)) {
      if (
        backgroundColor === BASIC_FOCUS_COLOR ||
        backgroundColor === SPECIAL_FOCUS_COLOR
      ) {
        // 流程快或者特殊块选中
        // if (!card.breakPoint) {

        // }
        prevBackgroundColor.current = BASIC_COLOR;

        if (statementType === 'basic') {
          preBorder.current = `1px solid ${BASIC_BORDER}`;
        } else {
          preMainHeadBackgroundColor.current = SPECIAL_HEAD_COLOR;
          preOthersHeadBackgroundColor.current = SPECIAL_OTHER_HEAD_COLOR;
          preBorder.current = `1px solid ${SPECIAL_BORDER}`;
        }
      } else if (backgroundColor === LIGHT_COMMENT_COLOR) {
        preBorder.current = `1px solid ${BASIC_BORDER}`;
      } else if (backgroundColor === DEEP_COMMENT_COLOR) {
        preBorder.current = `1px solid ${BASIC_BORDER}`;
      } else if (backgroundColor === DEBUG_COLOR) {
        preBorder.current = `1px solid ${BASIC_BORDER}`;
      }
    }

    if (isIgnore) {
      if (statementType === 'basic') {
        setBackgroundColor(LIGHT_COMMENT_COLOR);
        setBorder(preBorder.current);
      } else {
        setBackgroundColor(DEEP_COMMENT_COLOR);
        setBorder(preBorder.current);
      }
      // setBorder('1px solid #F2F2F2');
    } else if (isBreak) {
      setBackgroundColor(DEBUG_COLOR);
      setBorder(preBorder.current);
      // setBorder('1px solid #F2F2F2');
    } else {
      setBackgroundColor(prevBackgroundColor.current);
      setBorder(preBorder.current);
      setMainHeadBackgroundColor(preMainHeadBackgroundColor.current);
      setOthersHeadBackgroundColor(preOthersHeadBackgroundColor.current);
    }
  }, [checkedId, id, backgroundColor, isIgnore, isBreak]);

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
    isBreak,
    () => setIsBreak(isBreak => !isBreak),
  ];
};
