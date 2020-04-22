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

    const proxyCondition = (setVisible, requiredItem) => {
      const transformCondition = () => {
        const valueList = requiredItem.valueList || [];
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
        setVisible(result);
        forceUpdate();
      };

      const conditionEffect = () => {
        const item = requiredItem;
        // const descriptor = Object.getOwnPropertyDescriptor(item, 'forceUpdate');
        // if (descriptor && descriptor.get) {
        //   return;
        // }
        console.log(item);
        item.forceUpdate = item.forceUpdate || 0;
        item._forceUpdate = item.forceUpdate || 0;

        Object.defineProperty(item, 'forceUpdate', {
          get() {
            return this._forceUpdate;
          },
          set(value) {
            this._forceUpdate = value;

            if (requiredItem.tag === 1) {
              transformCondition();
            } else {
              forceUpdate();
            }
          },
        });
        transformCondition();
      };

      return conditionEffect;
    };

    if (
      node.text === '条件分支' &&
      node.properties.required[0].tag === /* 条件语句的向导模式 */ 1
    ) {
      node.properties.required[0] = { ...node.properties.required[0] };
      const conditionEffect = proxyCondition(
        setCondition,
        node.properties.required[0]
      );

      useEffect(() => {
        console.log('hhhhhh');
        conditionEffect();
      }, [node]);
      console.log(condition, '---condition');
      return [true, `如果满足 ${condition} 则`, () => {}, () => {}];
    }

    if (node.main === 'loop') {
      console.log(node);
      const proxy = node.properties.required[1];
      const forTypeNode = node.properties.required[0];
      let select = forTypeNode.value;

      const setConditionVisible = conditionExpression => {
        const visibleTemplat = `循环：当 ${conditionExpression} 成立时`;
        setNewVisible(visibleTemplat);
      };

      const getVisibleTemplate = () => {
        let template = '';
        if (select === 'for_list') {
          template = '用 {{value}} 遍历数组 {{arrayRet}}';
        } else if (select === 'for_dict') {
          template = '用 {{key}},{{value}} 遍历字段 {{dictVar}}';
        } else if (select === 'for_times') {
          template =
            '循环：{{index}} 从 {{startIndex}} 到 {{endIndex}} ， 每次增加 {{step}}';
        } else if (select === 'for_condition' && proxy.tag === 2) {
          template = '循环：当 {{value}} 成立时';
        } else if (select === 'for_condition' && proxy.tag === 1) {
          template = newVisible;
        }
        return template;
      };
      node.properties.required[1] = { ...node.properties.required[1] };
      const conditionEffect = proxyCondition(
        setConditionVisible,
        node.properties.required[1]
      );
      visibleTemplate = getVisibleTemplate();

      const getNameValue = () => {
        let nameMapValue = {};
        const proxyValue = proxy.value;
        let valueArray = proxyValue.split(' ');
        if (select === 'for_list') {
          nameMapValue = { ...nameMapValue, value: valueArray[0] };
          nameMapValue = { ...nameMapValue, arrayRet: valueArray[2] };
        } else if (select === 'for_dict') {
          const key = proxyValue.split(',');
          const value = proxyValue.match(/,([^\s]*)/);
          nameMapValue = { ...nameMapValue, key: key[0] };
          nameMapValue = {
            ...nameMapValue,
            value: value ? value[1] : '',
          };
          nameMapValue = {
            ...nameMapValue,
            dictVar: valueArray[valueArray.length - 1],
          };
        } else if (select === 'for_times') {
          nameMapValue = { ...nameMapValue, index: valueArray[0] };
          valueArray = proxyValue.substring(
            proxyValue.indexOf('range(') + 6,
            proxyValue.length - 1
          );
          valueArray = valueArray.split(',');
          nameMapValue = { ...nameMapValue, startIndex: valueArray[0] };
          nameMapValue = { ...nameMapValue, endIndex: valueArray[1] };
          nameMapValue = { ...nameMapValue, step: valueArray[2] };
        } else if (select === 'for_condition')
          nameMapValue = { ...nameMapValue, value: proxyValue };
        return nameMapValue;
      };

      const composeVaule = (name, value, originValue) => {
        let result = '';
        if (select === 'for_list') {
          if (name === 'value') {
            result =
              value.concat(
                originValue.substring(originValue.indexOf(' in '))
              ) || '';
          } else if (name === 'arrayRet') {
            result =
              originValue
                .substring(0, originValue.indexOf(' in ') + 4)
                .concat(value) || '';
          }
        } else if (select === 'for_dict') {
          if (name === 'key') {
            result =
              value.concat(originValue.substring(originValue.indexOf(','))) ||
              '';
          } else if (name === 'value') {
            result = originValue.replace(/,([^\s]*)/, `,${value}`) || '';
          } else if (name === 'dictVar') {
            result = originValue.replace(/in [^\s]*/, `in ${value}`) || '';
          }
        } else if (select === 'for_condition') {
          result = value;
        }
        return result;
      };

      const updateTemplate = template => {
        const nameMapValue = getNameValue();
        const result = template.replace(/({{.*?}})/g, (_, ...args) => {
          const enName = args[0].replace(/{|}/g, '');
          if (proxy) {
            return (
              `<span data-anchor=${enName} class="template_span ${
                proxy.value === '' ? 'template_span__empty' : ''
              }">${nameMapValue[enName]}</span>` || ''
            );
          }
        });
        setNewVisible(result);
      };

      // 对属性的改变做一个代理
      useEffect(() => {
        proxy._value = proxy.value;
        Object.defineProperty(proxy, 'value', {
          get() {
            return this._value;
          },
          set(value) {
            this._value = value;
            updateTemplate(getVisibleTemplate());
          },
        });

        forTypeNode._value = forTypeNode.value;
        Object.defineProperty(forTypeNode, 'value', {
          get() {
            return this._value;
          },
          set(value) {
            this._value = value;
            select = value;
            updateTemplate(getVisibleTemplate());
          },
        });

        proxy._tag = proxy.tag;
        Object.defineProperty(proxy, 'tag', {
          get() {
            return this._tag;
          },
          set(value) {
            this._tag = value;
            updateTemplate(getVisibleTemplate());
          },
        });
        conditionEffect();
        updateTemplate(visibleTemplate);
      }, [id]);

      const changeToEditableTemplate = anchor => {
        if (select === 'for_condition' && proxy.tag === '1') {
          return;
        }
        const nameMapValue = getNameValue();
        const result = visibleTemplate.replace(/({{.*?}})/g, (_, ...args) => {
          const enName = args[0].replace(/{|}/g, '');
          if (anchor !== enName) {
            return (
              `<span data-anchor=${enName} class="template_span">${nameMapValue[enName]}</span>` ||
              ''
            );
          }
          const html = `<input data-anchor=${anchor} class="template_input template_input_${anchor}" value="${
            nameMapValue[enName] !== ''
              ? nameMapValue[enName]
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&apos;')
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
        if (proxy) {
          proxy.value = composeVaule(dataId, newValue, proxy.value);
          event.emit('forceUpdate', select);
        }

        setCanDrag(true);
        updateTemplate(getVisibleTemplate());
        handleEmitCodeTransform(cards);
      };

      return [canDrag, newVisible, changeToEditableTemplate, saveInputChange];
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
            `<span data-anchor=${
              find.componentType === 1 ? '' : find.enName
            } class="template_span ${
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
      }, 100);
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
