import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { CHANGE_CHECKEDID } from '../../../../actions/codeblock';

const prevChecked = {
  dom: null,
  originColor: undefined,
};

export default ({ className }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    const container = document.querySelector(`.${className}`);
    const handleClick = e => {
      const checkedId = e.target.getAttribute('data-id');
      if (checkedId) {
        if (prevChecked.dom) {
          // 恢复之前选中的代码块
          prevChecked.dom.style.backgroundColor = prevChecked.originColor;
        }
        prevChecked.dom = e.target;
        prevChecked.originColor = e.target.style.backgroundColor;
        e.target.style.backgroundColor = 'aquamarine';

        dispatch({
          type: CHANGE_CHECKEDID,
          payload: checkedId,
        });
      }
    };
    container.addEventListener('click', handleClick, false);
    return () => {
      container.removeEventListener('click', handleClick, false);
    };
  }, []);
};
