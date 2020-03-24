import React from 'react';

export default ({ item, onAddControl }) => {
  return (
    <div className="interactive-control" onClick={() => onAddControl(item)}>
      {item.label}
    </div>
  );
};
