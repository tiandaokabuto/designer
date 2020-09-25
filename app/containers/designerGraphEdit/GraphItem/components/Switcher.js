import React, { useEffect, useState, useRef } from 'react';
import { Icon } from 'antd';

export default ({ expandedKeys, level }) => {
  console.log(level);
  const [text, setText] = useState('plus');
  const iconRef = useRef(null);
  useEffect(() => {
    const offsetParent = iconRef.current.offsetParent; // ant-tree-switcher_open
    const titleNode =
      level === 2
        ? offsetParent.childNodes[1].firstElementChild.firstElementChild
        : offsetParent.childNodes[1].childNodes[1].firstElementChild; // 第二层目录
    // console.log(titleNode);
    console.log(offsetParent);
    if (titleNode) {
      expandedKeys.forEach(item => {
        if (titleNode.classList.contains(`mulu-${item}`)) {
          if (text === 'plus') {
            setText('minus');
          }
        }
      });
    } else if (offsetParent) {
      // 旧版的判断逻辑
      if (offsetParent.classList.contains('ant-tree-switcher_open')) {
        if (text === 'plus') {
          setText('minus');
        }
      }
    }

    // if (
    //   offsetParent &&
    //   offsetParent.classList.contains('ant-tree-switcher_open')
    // ) {
    //   if (text === 'plus') {
    //     setText('minus');
    //   }
    // }
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
        setText(t => (t === 'plus' ? 'minus' : 'plus'));
      }}
    >
      <Icon type={text === 'plus' ? 'plus-square' : 'minus-square'} />
    </div>
  );
};
