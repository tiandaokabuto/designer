import React, { useEffect, useState } from 'react';

export default () => {
  const [text, setText] = useState('切换');
  return (
    <div
      className="toggle"
      onClick={() => {
        setText(t => (t === '切换' ? '折叠' : '切换'));
      }}
    >
      {text}
    </div>
  );
};
