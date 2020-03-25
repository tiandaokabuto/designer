import React from 'react';

export default ({ children, gridItem }) => {
  return (
    <div
      data-id={gridItem.i}
      style={{
        //padding: 12,
        width: '100%',
        height: '100%',
      }}
    >
      {children}
    </div>
  );
};
