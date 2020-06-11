/**
 * 判断原子能力是否可以查找目标
 */

export default card => {
  if (!card || !card.properties) return false;
  const required = card.properties.required || [];
  const optional = card.properties.optional || [];
  return (
    required.some(item => item.enName === 'xpath') ||
    optional.some(item => item.enName === 'xpath') ||
    card.main === 'mousePosition' ||
    card.main === 'changeWinStatus' ||
    card.main === 'closeWin'
  );
};
