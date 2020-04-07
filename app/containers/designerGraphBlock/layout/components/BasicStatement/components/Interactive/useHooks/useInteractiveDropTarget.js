import { useRef } from 'react';
import { useDrop } from 'react-dnd';

import { Interactive } from '../ItemTypes';

export default ({}) => {
  const ref = useRef(null);
  const [collectProps, drop] = useDrop({
    accept: Interactive,
    collect: monitor => {
      return {
        isOver: monitor.isOver(),
      };
    },
    drop(item, monitor) {},
  });
  return [collectProps, ref, drop];
};
