export const generateLastPosition = data => {
  let position = {
    x: 0,
    y: 0,
  };
  if (!data) return position;
  data.forEach(item => {
    if (item.y + item.h > position.y) {
      position.y = item.y + item.h;
    }
  });
  return position;
};
