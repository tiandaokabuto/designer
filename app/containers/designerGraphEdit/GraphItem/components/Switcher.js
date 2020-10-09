import React, { useEffect, useState, useRef } from 'react';
import { Icon } from 'antd';

import event from '@/containers/eventCenter';

export default ({ expandedKeys, level }) => {
  const [text, setText] = useState('plus');
  const iconRef = useRef(null);
  const getTitleNode = () => {
    if (level === 2) {
      // 第二层
      if (localStorage.getItem('secondLeftHide') === 'true') return;
    }
    const offsetParent = iconRef.current.offsetParent
      ? iconRef.current.offsetParent
      : undefined; // ant-tree-switcher_open

    const titleNode =
      level === 2
        ? offsetParent.childNodes[1].firstElementChild.firstElementChild // 第二层目录
        : offsetParent.childNodes[1].childNodes[1].firstElementChild; // 第一层目录
    return titleNode;
  };
  const handleChangeIcon = key => {
    const titleNode = getTitleNode();
    if (titleNode) {
      if (titleNode.classList.contains(`mulu-${key}`)) {
        setText(t => (t === 'plus' ? 'minus' : 'plus'));
      }
    }
  };
  useEffect(() => {
    const titleNode = getTitleNode();
    if (titleNode) {
      expandedKeys.forEach(item => {
        if (titleNode.classList.contains(`mulu-${item}`)) {
          if (text === 'plus') {
            setText('minus');
          }
        }
      });
    }
    // else if (offsetParent) {
    //   // 旧版的判断逻辑
    //   if (offsetParent.classList.contains('ant-tree-switcher_open')) {
    //     if (text === 'plus') {
    //       setText('minus');
    //     }
    //   }
    // }
    event.addListener('click_without_icon', handleChangeIcon);
    return () => {
      event.removeListener('click_without_icon', handleChangeIcon);
    };
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
