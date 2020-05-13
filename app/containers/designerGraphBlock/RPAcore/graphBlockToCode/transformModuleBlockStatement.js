import React from 'react';

import transformVariable from '../../../designerGraphEdit/RPAcore/transformVariable';
import { uuid } from '../../../common/utils';

const transformModuleBlockStatement = (
  padding,
  statement,
  result,
  blockNode,
  transformBlockToCodeImpl,
  depth
) => {
  const tail = uuid();
  const inputParamKV = statement.properties
    .find(item => item.cnName === '输入参数')
    .value.map(item => `${item.name} = ${item.value}`)
    .join(',');
  const inputParamK = statement.properties
    .find(item => item.cnName === '输入参数')
    .value.map(item => `${item.name}`)
    .join(',');
  const outputParam = statement.properties
    .find(item => item.cnName === '流程块返回')
    .value.map(item => item.name)
    .join(',');
  const variables = transformVariable(
    statement.graphDataMap.variable,
    depth + 1
  );
  if (inputParamK) {
    result.output += `${padding}def RPA_Atomic_${tail}(${inputParamK}):\n\n`;
  } else {
    result.output += `${padding}def RPA_Atomic_${tail}():\n\n`;
  }
  result.output += `${variables}`;
  transformBlockToCodeImpl(statement.graphDataMap.cards, depth + 1, blockNode);
  if (outputParam) {
    result.output += `\n${padding}${outputParam} = RPA_Atomic_${tail}(${inputParamKV})\n`;
  } else {
    result.output += `\n${padding}RPA_Atomic_${tail}(${inputParamKV})\n`;
  }
};

export default transformModuleBlockStatement;
