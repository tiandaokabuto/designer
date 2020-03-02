import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { findNodeLevelById, findNodeById } from '../shared/utils';
import { useEffect } from 'react';

export default (id, visibleTemplate) => {
  if (visibleTemplate) {
    const [newVisible, setNewVisible] = useState('');
    const cards = useSelector(state => state.blockcode.cards);
    const node = findNodeById(cards, id);
    /**
     * 对属性的改变做一个代理
     */
    useEffect(() => {
      const watchingList = visibleTemplate
        .match(/({{.*?}})/g)
        .map(item => item.replace(/[{}]/g, ''));
      const proxyList = node.properties.required.filter(item =>
        watchingList.includes(item.enName)
      );
      proxyList.push(
        ...node.properties.optional.filter(item =>
          watchingList.includes(item.enName)
        )
      );
      const updateTemplate = template => {
        let result = template.replace(/({{.*?}})/g, (_, ...args) => {
          const find = proxyList.find(item => args[0].includes(item.enName));
          return find.value || '';
        });
        setNewVisible(result);
      };
      proxyList.forEach(item => {
        item._value = item.value;
        Object.defineProperty(item, 'value', {
          get() {
            return this._value;
          },
          set(value) {
            this._value = value;
            updateTemplate(visibleTemplate);
          },
        });
      });
      updateTemplate(visibleTemplate);
    }, [id]);

    return newVisible;
  }
  return '';
};
