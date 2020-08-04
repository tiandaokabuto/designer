import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { CHANGE_CHECKEDID } from '../../../constants/actions/codeblock';
import { keyDownMap } from './useListenMouseAndKeyboard';

const prevChecked = {
  dom: null,
};

export default ({ className }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    const container = document.querySelector(`.${className}`);
    const handleClick = e => {
      const checkedId = e.target.getAttribute('data-id');
      if (checkedId && !keyDownMap.isShiftDown && !keyDownMap.isCtrlDown) {
        dispatch({
          type: CHANGE_CHECKEDID,
          payload: [checkedId],
        });
      }
    };
    container.addEventListener('click', handleClick, false);
    return () => {
      container.removeEventListener('click', handleClick, false);
    };
  }, []);
};
