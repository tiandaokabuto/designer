import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect } from 'react';

import { findNodeLevelById, findNodeById } from '../shared/utils';
import event from '../eventCenter';

export default (id, visibleTemplate) => {
  if (visibleTemplate) {
    const [newVisible, setNewVisible] = useState('');
    const [canDrag, setCanDrag] = useState(true);
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
        return (
          `<span data-anchor=${find.enName} class="template_span">${find.value}</span>` ||
          ''
        );
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

    const changeToEditableTemplate = anchor => {
      let result = visibleTemplate.replace(/({{.*?}})/g, (_, ...args) => {
        const find = proxyList.find(item => args[0].includes(item.enName));
        // 判断是否为点击对象
        if (anchor !== find.enName) {
          return (
            `<span data-anchor=${find.enName} class="template_span">${find.value}</span>` ||
            ''
          );
        }
        return (
          `<input data-anchor=${
            find.enName
          } class="template_input template_input_${anchor}" value=${find.value ||
            ''} >` || ''
        );
      });
      setCanDrag(false);
      setNewVisible(result);
      setTimeout(() => {
        const inputDom = document.querySelector(
          `input.template_input_${anchor}`
        );
        inputDom.focus();
      }, 0);
    };

    const saveInputChange = e => {
      const dataId = e.target.dataset.anchor;
      const newValue = e.target.value;
      // save
      const find = proxyList.find(item => item.enName === dataId);
      if (find) {
        find.value = newValue || null;
        // forceUpdate
        event.emit('forceUpdate');
      }
      // reset
      setCanDrag(true);
      updateTemplate(visibleTemplate);
    };

    return [canDrag, newVisible, changeToEditableTemplate, saveInputChange];
  }
  return [];
};
