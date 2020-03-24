import React from 'react';

export default ({ children, gridItem }) => {
  return (
    <div
      data-id={gridItem.i}
      style={{
        padding: 12,
      }}
    >
      {children}
    </div>
  );
};
