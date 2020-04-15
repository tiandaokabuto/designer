import { useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';

import event from '../eventCenter';

// Number（数字）
// String（字符串）
// List（列表）
// Dictionary（字典）
// bool（布尔

const typeOf = value => {
  if (/['"]/.test(value)) {
    return 'String';
  } else if (/^True$|^False$/.test(value)) {
    return 'Boolean';
  } else if (/^[0-9]+$/.test(value)) {
    return 'Number';
  } else if (/\[|\]/.test(value)) {
    return 'List';
  } else if (/\{|\}/.test(value)) {
    return 'Dictionary';
  } else {
    return undefined;
  }
};

const removeDuplicateItem = (aiHintList, item) => {
  Object.values(aiHintList).forEach(list => {
    const index = list.findIndex(child => child === item);
    if (index !== -1) {
      list.splice(index, 1);
    }
  });
};

export default () => {
  const aiHintList = useSelector(state => state.blockcode.aiHintList);

  const graphDataMap = useSelector(state => state.grapheditor.graphDataMap);

  const checkedGraphBlockId = useSelector(
    state => state.grapheditor.checkedGraphBlockId
  );

  const variableList = useMemo(() => {
    if (graphDataMap && checkedGraphBlockId) {
      const variable = graphDataMap.get(checkedGraphBlockId).variable || [];
      return variable;
    }
    return [];
  }, [graphDataMap, checkedGraphBlockId]);

  variableList.forEach(item => {
    if (item.name && item.value) {
      const type = typeOf(item.value);
      if (type === undefined) return;
      item.isVariable = true;
      if (item.listeners) {
        item.listeners = item.listeners.filter(Boolean);
      }
      removeDuplicateItem(aiHintList, item);
      if (aiHintList[type]) {
        if (aiHintList[type].find(el => el === item)) return;
        aiHintList[type].push(item);
      } else {
        aiHintList[type] = [item];
      }
    }
  });

  useEffect(() => {
    const handleVariableDelete = item => {
      removeDuplicateItem(aiHintList, item);
    };
    event.addListener('varibaleDelete', handleVariableDelete);
    return () => {
      event.removeListener('varibaleDelete', handleVariableDelete);
    };
  }, [aiHintList]);

  return [aiHintList];
};
