import { useDrag } from 'react-dnd';

import { Interactive } from '../ItemTypes';

export default ({ item }) => {
  const [, drag, dragImage] = useDrag({
    item: { type: Interactive, ...item },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
    begin(monitor) {},
    end(monitor) {},
  });
  return [drag, dragImage];
};
