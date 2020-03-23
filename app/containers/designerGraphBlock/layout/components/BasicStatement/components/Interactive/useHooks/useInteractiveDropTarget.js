import { useRef } from 'react';
import { useDrop } from 'react-dnd';

import { Interactive } from '../ItemTypes';

export default () => {
  const ref = useRef(null);
  const [collectProps, drop] = useDrop({
    accept: Interactive,
    // hover(item, monitor) {
    //   // console.log('hover');
    // },
    collect: monitor => {
      return {
        isOver: false,
      };
    },
    drop(item, monitor) {
      console.log(item, '----item');
    },
  });
  return [collectProps, ref, drop];
};
