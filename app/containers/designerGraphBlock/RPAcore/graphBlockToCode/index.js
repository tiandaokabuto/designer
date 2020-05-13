import transformBasicStatement from './transformBasicStatement';
import transformPrintStatement from './transformPrintStatement';
import transformLoopStatement from './transformLoopStatement';
import transformConditionalStatement from './transformConditionalStatement';
import transformReturnStatement from './transformReturnStatement';
import transformBreakStatement from './transformBreakStatement';
import transformContinueStatement from './transformContinueStatement';
import transformSleepStatement from './transformSleepStatement';
import transformVariableDeclar from './transformVariableDeclar';
import transformCustomCodeStatement from './transformCustomCodeStatement';
import transformModuleBlockStatement from './transformModuleBlockStatement';
import memoize from './reselect';
import {
  BasicStatementTag,
  PrintStatementTag,
  ReturnStatementTag,
  BreakStatementTag,
  ContinueStatementTag,
  SleepStatementTag,
  VariableDeclareTag,
  CustomCodeBlockTag,
  ModuleBlockTag,
} from '../../layout/statementTags';
import { isArray } from './utils';

import transformVariable from '../../../designerGraphEdit/RPAcore/transformVariable';

const paddingStart = (length) => '    '.repeat(length);

const result = {
  output: '',
};

const moduleMap = new Map();

const transformBlockToCodeImpl = (
  dataStructure,
  depth = 0,
  blockNode,
  options = {}
) => {
  if (!dataStructure) return;
  const padding = paddingStart(depth);
  dataStructure.forEach((statement, index) => {
    switch (statement.$$typeof) {
      case 1: // 基础语句
        /* 处理基础语句下的子语句 */
        if (
          statement.subtype && // ModuleBlockTag
          (statement.subtype & ModuleBlockTag) === ModuleBlockTag
        ) {
          if (statement.graphDataMap && statement.graphDataMap.cards) {
            transformModuleBlockStatement(
              padding,
              statement,
              result,
              blockNode,
              transformBlockToCodeImpl,
              depth
            );
          }
        } else if (
          statement.subtype &&
          (statement.subtype & PrintStatementTag) === PrintStatementTag
        ) {
          if (!statement.transformPrintStatement) {
            statement.transformPrintStatement = memoize(
              transformPrintStatement
            );
          }
          const buffer = statement.transformPrintStatement(
            padding,
            statement,
            { output: '' },
            moduleMap,
            options
          );
          if (Array.isArray(buffer)) {
            result.output += buffer[0];
          } else {
            result.output += buffer;
          }
        } else if (
          statement.subtype &&
          (statement.subtype & ReturnStatementTag) === ReturnStatementTag
        ) {
          if (!statement.transformReturnStatement) {
            statement.transformReturnStatement = memoize(
              transformReturnStatement
            );
          }
          const buffer = statement.transformReturnStatement(
            padding,
            statement,
            { output: '' },
            blockNode,
            options
          );
          if (Array.isArray(buffer)) {
            result.output += buffer[0];
          } else {
            result.output += buffer;
          }
        } else if (
          statement.subtype &&
          (statement.subtype & BreakStatementTag) === BreakStatementTag
        ) {
          if (!statement.transformBreakStatement) {
            statement.transformBreakStatement = memoize(
              transformBreakStatement
            );
          }
          const buffer = statement.transformBreakStatement(
            padding,
            statement,
            { output: '' },
            moduleMap,
            options
          );
          if (Array.isArray(buffer)) {
            result.output += buffer[0];
          } else {
            result.output += buffer;
          }
          // transformBreakStatement(padding, statement, result, options);
        } else if (
          statement.subtype && // ContinueStatementTag
          (statement.subtype & ContinueStatementTag) === ContinueStatementTag
        ) {
          if (!statement.transformContinueStatement) {
            statement.transformContinueStatement = memoize(
              transformContinueStatement
            );
          }
          const buffer = statement.transformContinueStatement(
            padding,
            statement,
            { output: '' },
            moduleMap,
            options
          );
          if (Array.isArray(buffer)) {
            result.output += buffer[0];
          } else {
            result.output += buffer;
          }
        } else if (
          statement.subtype && // VariableDeclareTag
          (statement.subtype & SleepStatementTag) === SleepStatementTag
        ) {
          if (!statement.transformSleepStatement) {
            statement.transformSleepStatement = memoize(
              transformSleepStatement
            );
          }
          const buffer = statement.transformSleepStatement(
            padding,
            statement,
            { output: '' },
            moduleMap,
            options
          );
          if (Array.isArray(buffer)) {
            result.output += buffer[0];
          } else {
            result.output += buffer;
          }
          // transformSleepStatement(
          //   padding,
          //   statement,
          //   result,
          //   moduleMap,
          //   options
          // );
        } else if (
          statement.subtype &&
          (statement.subtype & VariableDeclareTag) === VariableDeclareTag
        ) {
          if (!statement.transformVariableDeclar) {
            statement.transformVariableDeclar = memoize(
              transformVariableDeclar
            );
          }
          const buffer = statement.transformVariableDeclar(
            padding,
            statement,
            { output: '' },
            moduleMap,
            options
          );
          if (Array.isArray(buffer)) {
            result.output += buffer[0];
          } else {
            result.output += buffer;
          }
        } else if (
          statement.subtype && // CustomCodeBlockTag
          (statement.subtype & CustomCodeBlockTag) === CustomCodeBlockTag
        ) {
          transformCustomCodeStatement(padding, statement, result, moduleMap);
        } else {
          if (!statement.transformBasicStatement) {
            statement.transformBasicStatement = memoize(
              transformBasicStatement
            );
          }
          const buffer = statement.transformBasicStatement(
            padding,
            statement,
            { output: '' },
            moduleMap,
            options
          );
          if (Array.isArray(buffer)) {
            result.output += buffer[0];
          } else {
            result.output += buffer;
          }
        }
        result.output += '\n';
        break;
      case 2: // while or for
        transformLoopStatement(padding, statement, result, options);
        transformBlockToCodeImpl(
          statement.children,
          depth + 1,
          blockNode,
          options
        );
        // transformBlockToCodeImpl(statement.children, depth + 1, blockNode, {
        //   ...options,
        //   ignore: options.ignore || statement.ignore,
        // });
        break;
      case 4:
        transformConditionalStatement(padding, statement, result);
        if (!statement.ifChildren.length) {
          result.output += `${paddingStart(depth + 1)}pass\n`;
        } else {
          transformBlockToCodeImpl(
            statement.ifChildren,
            depth + 1,
            blockNode,
            options
          );
        }
        const ignore = statement.ignore ? '# ' : '';
        result.output += `${padding}${ignore}else:\n`;
        if (!statement.elseChildren.length) {
          result.output += `${paddingStart(depth + 1)}pass\n`;
        } else {
          transformBlockToCodeImpl(
            statement.elseChildren,
            depth + 1,
            blockNode,
            options
          );
        }
      default:
      // do nothing
    }
  });
};

const transformModuleImport = (result, moduleMap, depth) => {
  let prefix = '';
  for (const [moduleName, pkg] of moduleMap) {
    prefix += `${paddingStart(depth)}from ${moduleName} import ${
      isArray(pkg) ? pkg.join(',') : pkg
    }\n`;
  }
  result.output = prefix + '\n' + result.output;
};

const transformModuleVariable = (result, depth, variable) => {
  if (Array.isArray(variable)) {
    result.output += `${variable
      .filter((item) => item.name && item.value)
      .map((item) => paddingStart(depth) + item.name + ' = ' + item.value)
      .join('\n')}\n`;
  }
};

export default (dataStructure, depth = 0, blockNode) => {
  result.output = '';
  if (blockNode) {
    transformModuleVariable(result, depth, blockNode.variable || []);
  }
  moduleMap.clear();
  transformBlockToCodeImpl(dataStructure, depth, blockNode, {});
  transformModuleImport(result, moduleMap, depth);
  if (result.output === '\n' || result.output == '\n\n') {
    result.output = paddingStart(depth) + 'pass\n';
  }
  return result;
};
