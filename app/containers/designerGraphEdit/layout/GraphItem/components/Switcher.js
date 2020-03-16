import React, { useEffect, useState } from 'react';
import { Icon } from 'antd';

export default props => {
  const [text, setText] = useState('close');

  return (
    <div
      className="toggle_switcher"
      style={{
        position: 'absolute',
        left: '200px',
        top: '4px',
      }}
      onClick={() => {
        setText(t => (t === 'open' ? 'close' : 'open'));
      }}
    >
      <Icon type={text === 'open' ? 'plus-square' : 'minus-square'} />
    </div>
  );
};
