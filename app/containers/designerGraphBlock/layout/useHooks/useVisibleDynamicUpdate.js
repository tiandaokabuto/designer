import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect } from 'react';

import { findNodeLevelById, findNodeById } from '../shared/utils';
import event from '../eventCenter';
import useTransformToPython from './useTransformToPython';

export default (id, visibleTemplate) => {
  if (visibleTemplate) {
    const cards = useSelector(state => state.blockcode.cards);
    const handleEmitCodeTransform = useTransformToPython();
    const [newVisible, setNewVisible] = useState('');
    const [canDrag, setCanDrag] = useState(true);
    const node = findNodeById(cards, id);
    const watchingListTemp = visibleTemplate.match(/({{.*?}})/g);
    if (watchingListTemp === null) return [true, visibleTemplate];
    const watchingList = watchingListTemp.map(item =>
      item.replace(/[{}]/g, '')
    );
    const proxyList = node.properties.required.filter(item =>
      watchingList.includes(item.enName)
    );
    node.properties.optional &&
      proxyList.push(
        ...node.properties.optional.filter(item =>
          watchingList.includes(item.enName)
        )
      );
    const updateTemplate = template => {
      let result = template.replace(/({{.*?}})/g, (_, ...args) => {
        const find = proxyList.find(item => args[0].includes(item.enName));
        return (
          `<span data-anchor=${find.enName} class="template_span ${
            find.value === '' ? 'template_span__empty' : ''
          }">${find.value}</span>` || ''
        );
      });
      setNewVisible(result);
    };
    // 对属性的改变做一个代理
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
        console.log(anchor);
        if (anchor !== find.enName) {
          return (
            `<span data-anchor=${find.enName} class="template_span">${find.value}</span>` ||
            ''
          );
        }
        return (
          `<input data-anchor=${
            find.enName
          } class="template_input template_input_${anchor}" value=${
            find.value !== '' ? find.value : ''
          } >` || ''
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
      const find = proxyList.find(item => item.enName === dataId);
      if (find) {
        find.value = newValue || '';
        event.emit('forceUpdate');
      }

      setCanDrag(true);
      updateTemplate(visibleTemplate);
      handleEmitCodeTransform(cards);
    };

    return [canDrag, newVisible, changeToEditableTemplate, saveInputChange];
  }
  return [true];
};
