import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import useForceUpdate from 'react-hook-easier/lib/useForceUpdate';

import {
  findNodeLevelById,
  findNodeById,
} from '../../../utils/designerGraphBlock/utils';
import event from '@/containers/eventCenter';
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

    const transformCondition = (requiredItem, setVisible) => {
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
      // forceUpdate();
    };

    if (
      node.text === '条件分支' &&
      node.properties.required[0].tag === /* 条件语句的向导模式 */ 1
    ) {
      useEffect(() => {
        node.properties.required[0] = { ...node.properties.required[0] };
        const item = node.properties.required[0];
        /*  const descriptor = Object.getOwnPropertyDescriptor(item, 'forceUpdate');
        if (descriptor && descriptor.get) {
          return;
        } */
        item.forceUpdate = item.forceUpdate || 0;
        item._forceUpdate = item.forceUpdate || 0;

        Object.defineProperty(item, 'forceUpdate', {
          get() {
            return this._forceUpdate;
          },
          set(value) {
            this._forceUpdate = value;

            if (node.properties.required[0].tag === 1) {
              transformCondition(node.properties.required[0], setCondition);
            } else {
              // transformCondition();
              forceUpdate();
            }
          },
        });
        transformCondition(node.properties.required[0], setCondition);
      }, [node]);
      return [true, `如果满足 ${condition} 则`, () => {}, () => {}];
    }

    if (node.main === 'loop') {
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
          template = `循环：当 {{}} 成立时`;
        }
        return template;
      };
      visibleTemplate = getVisibleTemplate();

      const updateTemplate = template => {
        const result = template.replace(/({{.*?}})/g, (_, ...args) => {
          const enName = args[0].replace(/{|}/g, '');
          let value = '';
          if (proxy[select]) {
            const temp = proxy[select].filter(item => item.enName === enName);
            value = (temp[0] || {}).value;
          } else if (select === 'for_condition' && proxy.tag === 2) {
            value = proxy.value;
          }
          if (proxy) {
            return (
              `<span data-anchor=${enName} class="template_span ${
                value === '' ? 'template_span__empty' : ''
              }">${value}</span>` || ''
            );
          }
        });
        setNewVisible(result);
      };

      // 对属性的改变做一个代理
      useEffect(() => {
        forTypeNode._value = forTypeNode.value;
        Object.defineProperty(forTypeNode, 'value', {
          get() {
            return this._value;
          },
          set(value) {
            this._value = value;
            select = value;
            if (proxy.tag === 1 && select === 'for_condition') {
              transformCondition(proxy, setConditionVisible);
            } else {
              updateTemplate(getVisibleTemplate());
            }
          },
        });

        proxy.forceUpdate = proxy.forceUpdate || 0;
        proxy._forceUpdate = proxy.forceUpdate;
        Object.defineProperty(proxy, 'forceUpdate', {
          get() {
            return this._forceUpdate;
          },
          set(value) {
            this._forceUpdate = value;

            if (proxy.tag === 1 && select === 'for_condition') {
              transformCondition(proxy, setConditionVisible);
            } else {
              updateTemplate(getVisibleTemplate());
            }
          },
        });

        if (proxy.tag === 1 && select === 'for_condition') {
          transformCondition(proxy, setConditionVisible);
        } else updateTemplate(visibleTemplate);
      }, [id]);

      const changeToEditableTemplate = anchor => {
        const result = visibleTemplate.replace(/({{.*?}})/g, (_, ...args) => {
          const enName = args[0].replace(/{|}/g, '');
          let value = '';
          if (proxy[select]) {
            value = proxy[select].filter(item => item.enName === enName)[0]
              .value;
          } else if (select === 'for_condition' && proxy.tag === 2) {
            value = proxy.value;
          }
          if (anchor !== enName) {
            return (
              `<span data-anchor=${enName} class="template_span">${value}</span>` ||
              ''
            );
          }
          const html = `<input data-anchor=${anchor} class="template_input template_input_${anchor}" value="${
            value !== ''
              ? value.replace(/"/g, '&quot;').replace(/'/g, '&apos;')
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
          if (inputDom) inputDom.focus();
        }, 0);
      };

      const saveInputChange = e => {
        const dataId = e.target.dataset.anchor;
        const newValue = e.target.value;
        if (select === 'for_condition' && proxy.tag === 2) {
          proxy.value = newValue;
        } else if (proxy[select]) {
          proxy[select].some(item => {
            if (item.enName === dataId) {
              item.value = newValue;
              if (item.id.indexOf('tigger') > -1) {
                item.id = item.id.replace('tigger', '');
              } else {
                item.id = `tigger${item.id}`;
              }
              return true;
            }
          });
        }
        event.emit('forceUpdate', select);

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

        let value = '';
        if (find) {
          if (
            find.valueMapping &&
            find.valueMapping.length !== 0 &&
            find.cnName !== '条件' &&
            !Array.isArray(find.value)
          ) {
            value = find.valueMapping.find(item => item.value === find.value)
              .name;
          } else {
            value = find.value || find.default;
          }
          // if (
          //   template.indexOf('设置任务数据字典') !== -1 &&
          //   find.cnName === '状态'
          // ) {
          //   value = find.valueMapping.find(item => item.value === find.value)
          //     .name;
          // } else if (
          //   template.indexOf('新增名称为') !== -1 &&
          //   find.cnName === '优先级'
          // ) {
          // } else {
          //   value = find.value || find.default;
          // }
        }
        if (find && find.componentType === 2 && find.tag === 2) {
          const list = find.valueList;
          if (Array.isArray(list)) {
            value = `'${list[0].value}${list[1].value}'`;
            return value;
          }
        }
        if (find) {
          return (
            `<span data-anchor=${
              find.componentType === 1 ? '' : find.enName
            } class="template_span ${
              value === '' ? 'template_span__empty' : ''
            }">${value}</span>` || ''
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
        if (item.componentType === 2) {
          item.forceUpdate = item.forceUpdate || 0;
          item._forceUpdate = item.forceUpdate;
          Object.defineProperty(item, 'forceUpdate', {
            get() {
              return this._forceUpdate;
            },
            set(value) {
              this._forceUpdate = value;
              updateTemplate(visibleTemplate);
            },
          });
        }
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
