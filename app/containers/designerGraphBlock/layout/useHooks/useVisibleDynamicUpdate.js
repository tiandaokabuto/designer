import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect } from 'react';

import { findNodeLevelById, findNodeById } from '../shared/utils';
import event from '../eventCenter';

export default (id, visibleTemplate) => {
  if (visibleTemplate) {
    const [newVisible, setNewVisible] = useState('');
    const cards = useSelector(state => state.blockcode.cards);
    const node = findNodeById(cards, id);

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
        return `<span class="template_span">${find.value}</span>` || '';
      });
      setNewVisible(result);
    };
    /**
     * 对属性的改变做一个代理
     */
    useEffect(() => {
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

    const changeToEditableTemplate = () => {
      let result = visibleTemplate.replace(/({{.*?}})/g, (_, ...args) => {
        const find = proxyList.find(item => args[0].includes(item.enName));
        return (
          `<input data-id=${
            find.enName
          } class="template_input" value=${find.value || ''} >` || ''
        );
      });
      setNewVisible(result);
    };

    const saveInputChange = e => {
      const dataId = e.target.dataset.id;
      const newValue = e.target.value;
      console.log(dataId, typeof newValue);
      // save
      const find = proxyList.find(item => item.enName === dataId);
      if (find) {
        find.value = newValue || null;
        // forceUpdate
        event.emit('forceUpdate');
      }
      // reset
      updateTemplate(visibleTemplate);
    };

    return [newVisible, changeToEditableTemplate, saveInputChange];
  }
  return [];
};
