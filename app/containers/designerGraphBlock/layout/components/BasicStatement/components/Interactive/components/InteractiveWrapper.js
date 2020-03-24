import React from 'react';

export default ({ children, gridItem }) => {
  return <div data-id={gridItem.i}>{children}</div>;
};
