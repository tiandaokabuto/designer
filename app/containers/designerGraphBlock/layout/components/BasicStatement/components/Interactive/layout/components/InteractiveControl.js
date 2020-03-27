import React from 'react';

export default ({ item, onAddControl }) => {
  return (
    <div
      className="interactive-control"
      data-item={JSON.stringify(item)}
      onClick={() => onAddControl(item)}
    >
      {item.label}
    </div>
  );
};
