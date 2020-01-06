import React from 'react';

import IconFont from '../IconFont';

export default ({ type, title }) => {
  return (
    <div className="designergraph-header-command">
      <IconFont type={type} />
      {title}
    </div>
  );
};
