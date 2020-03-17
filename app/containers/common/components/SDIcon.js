import React from 'react';

import './SDIcon.scss';

export default ({ url, size, style = {}, onClick = () => {} }) => {
  return (
    <span className="sd-icon" onClick={onClick}>
      {url && (
        <img
          src={url}
          style={{
            width: size + 'px',
            ...style,
          }}
          alt="icon"
        />
      )}
    </span>
  );
};
