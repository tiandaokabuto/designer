import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import useForceUpdate from 'react-hook-easier/lib/useForceUpdate';

import { findNodeLevelById, findNodeById } from '../shared/utils';
import event from '../eventCenter';
import useTransformToPython from './useTransformToPython';

export default (id, visibleTemplate) => {
  if (visibleTemplate) {
    const cards = useSelector(state => state.blockcode.cards);
    const handleEmitCodeTransform = useTransformToPython();
    const [newVisible, setNewVisible] = useState('');
    const [condition, setCondition] = useState('');
    const [canDrag, setCanDrag] = useState(true);
    const [_, forceUpdate] = useForceUpdate();
    const node = findNodeById(cards, id);

    if (
      node.text === '条件分支' &&
      node.properties.required[0].tag === /* 条件语句的向导模式 */ 1
    ) {
      const transformCondition = () => {
        const valueList = node.properties.required[0].valueList || [];
        let result = '';
        valueList.forEach((item, index) => {
          if (index === valueList.length - 1) {
            // 最后一个，不把连接符填上
            if (item.rule === 'is None' || item.rule === 'not None') {
              result += `(${item.v1} ${item.rule}) `;
            } else {
              result += `(${item.v1} ${item.rule} ${item.v2}) `;
            }
          } else {
            if (item.rule === 'is None' || item.rule === 'not None') {
              result += `(${item.v1} ${item.rule}) ${item.connect} `;
            } else {
              result += `(${item.v1} ${item.rule} ${item.v2}) ${item.connect} `;
            }
          }
        });
        console.log(result, '---transformCondition');
        setCondition(result);
        forceUpdate();
      };

      useEffect(() => {
        const item = node.properties.required[0];
        const descriptor = Object.getOwnPropertyDescriptor(item, 'forceUpdate');
        if (descriptor && descriptor.get) {
          return;
        }
        item._forceUpdate = item.forceUpdate || 0;

        Object.defineProperty(item, 'forceUpdate', {
          get() {
            return this._forceUpdate;
          },
          set(value) {
            this._forceUpdate = value;

            if (node.properties.required[0].tag === 1) {
              console.log('转换');
              transformCondition();
            } else {
              forceUpdate();
            }
          },
        });
        transformCondition();
      }, [node]);
      console.log(condition, '---condition');
      return [true, `如果满足 ${condition} 则`, () => {}, () => {}];
    }
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
        const find = proxyList.find(item => {
          return args[0].includes(item.enName);
        });
        if (find) {
          return (
            `<span data-anchor=${find.enName} class="template_span ${
              find.value === '' ? 'template_span__empty' : ''
            }">${find.value}</span>` || ''
          );
        }
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

        if (anchor !== find.enName) {
          return (
            `<span data-anchor=${find.enName} class="template_span">${find.value}</span>` ||
            ''
          );
        }
        const html = `<input data-anchor=${
          find.enName
        } class="template_input template_input_${anchor}" value="${
          find.value !== ''
            ? find.value.replace(/"/g, '&quot;').replace(/'/g, '&apos;')
            : ''
        }" >`;
        return html;
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
