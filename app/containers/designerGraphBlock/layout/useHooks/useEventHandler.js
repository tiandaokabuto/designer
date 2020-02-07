import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { CHANGE_CHECKEDID } from '../../../../actions/codeblock';

const prevChecked = {
  dom: null,
};

export default ({ className }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    const container = document.querySelector(`.${className}`);
    const handleClick = e => {
      const checkedId = e.target.getAttribute('data-id');
      if (checkedId) {
        if (e.target.classList.contains('loopstatement-header')) {
          // TODO...
          return;
        }
        if (prevChecked.dom) {
          prevChecked.dom.style.borderStyle = 'dashed';
        }
        if (e.target.nextSibling) {
          prevChecked.dom = e.target.nextSibling;
          e.target.nextSibling.style.borderStyle = 'solid';

          dispatch({
            type: CHANGE_CHECKEDID,
            payload: checkedId,
          });
        }
      }
    };
    container.addEventListener('click', handleClick, false);
    return () => {
      container.removeEventListener('click', handleClick, false);
    };
  }, []);
};
