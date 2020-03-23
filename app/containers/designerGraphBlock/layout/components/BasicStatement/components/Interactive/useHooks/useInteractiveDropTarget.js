import { useRef } from 'react';
import { useDrop } from 'react-dnd';

import { Interactive } from '../ItemTypes';

export default () => {
  const ref = useRef(null);
  const [, drop] = useDrop({
    accept: Interactive,
    hover(item, monitor) {},
    drop(item, monitor) {},
  });
  return [ref, drop];
};
