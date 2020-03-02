import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { findNodeLevelById, findNodeById } from '../shared/utils';
import { useEffect } from 'react';

export default (id, visible, watchingList = ['outPut']) => {
  if (visible) {
    const [newVisible, setNewVisible] = useState(visible);
    const cards = useSelector(state => state.blockcode.cards);
    const node = findNodeById(cards, id);
    /**
     * 对属性的改变做一个代理
     */
    // const trapFunc = {
    //   set(trapTarget, key, value, receiver) {
    //     console.log(trapTarget, key, value, receiver);
    //     setNewVisible(value);
    //     return Reflect.set(trapTarget, key, value, receiver);
    //   },
    // };

    useEffect(() => {
      // const watch = { num: 1 };
      // Object.defineProperty(watch, 'num', {
      //   get() {
      //     return this._num;
      //   },
      //   set(value) {
      //     console.log('jjjj');
      //     this._num = value;
      //   },
      // });
      console.log('代理------', id);
      const proxyList = node.properties.required.filter(item =>
        watchingList.includes(item.enName)
      );
      proxyList.forEach(item => {
        // const proxy = new Proxy(item, trapFunc);
        // item.proxy = proxy;

        Object.defineProperty(item, 'value', {
          get() {
            return this._value;
          },
          set(value) {
            console.log('jjjj');
            this._value = value;
          },
        });
      });
    }, [id]);

    return newVisible;
  }
  return '';
};
