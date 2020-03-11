import React, { useEffect, useState } from 'react';
import { Icon } from 'antd';

export default props => {
  const [text, setText] = useState('open');

  return (
    <div
      className="toggle_switcher"
      onClick={() => {
        setText(t => (t === 'open' ? 'close' : 'open'));
      }}
    >
      <Icon type={text === 'open' ? 'plus-square' : 'minus-square'} />
    </div>
  );
};
