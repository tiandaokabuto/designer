import React, { useEffect, useState, useRef } from 'react';
import { Icon } from 'antd';

export default ({ expandedKeys }) => {
  const [text, setText] = useState('open');
  const iconRef = useRef(null);
  useEffect(() => {
    const offsetParent = iconRef.current; // ant-tree-switcher_open
    if (
      offsetParent &&
      offsetParent.classList.contains('ant-tree-switcher_open')
    ) {
      if (text === 'open') {
        setText('close');
      }
    }
  }, [expandedKeys]);
  return (
    <div
      className="toggle_switcher"
      ref={iconRef}
      style={{
        position: 'absolute',
        right: 20,
        // top: 6,
      }}
      onClick={() => {
        setText(t => (t === 'open' ? 'close' : 'open'));
      }}
    >
      <Icon type={text === 'open' ? 'plus-square' : 'minus-square'} />
    </div>
  );
};
