import uniqueId from 'lodash/uniqueId';

export const generateLastPosition = data => {
  let position = {
    x: 0,
    y: 0,
  };
  if (!data) return position;
  data.forEach(item => {
    if (item.y + item.h > position.y) {
      // 新增的位置 = y + 组件的高度h
      position.y = item.y + item.h;
    }
  });
  return position;
};

export const getUniqueId = (data = []) => {
  let id = uniqueId('control_');
  while (data.some(item => item.i === id)) {
    id = uniqueId('control_');
  }
  return id;
};
