import { useRef } from 'react';
import { useDrop } from 'react-dnd';

import { Interactive } from '../ItemTypes';

export default ({ onDrop }) => {
  const ref = useRef(null);
  const [collectProps, drop] = useDrop({
    accept: Interactive,
    // hover(item, monitor) {
    //   // console.log('hover');
    // },
    collect: monitor => {
      return {
        isOver: monitor.isOver(),
      };
    },
    drop(item, monitor) {
      console.log(item, '----item');
      onDrop();
    },
  });
  return [collectProps, ref, drop];
};
