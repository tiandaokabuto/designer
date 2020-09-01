import transformBasicStatement from './transformBasicStatement';
import transformPrintStatement from './transformPrintStatement';
import transformLoopStatement from './transformLoopStatement';
import transformConditionalStatement from './transformConditionalStatement';
import transformCatchStatement from './transformCatchStatement';
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
} from '../../constants/statementTags';

import transformBlockToCode_copy from './index';

const paddingStart = length => '    '.repeat(length);

const isArray = arr => {
  return arr && Array.isArray(arr);
};

const result = {
  output: '',
};

const stepsTemp = {
  list: [],
  index: 0,
};

export const getStepsTemp = () =>{
  return stepsTemp;
}

const moduleMap = new Map();
let temp = '';

const transformBlockToCodeImpl = (
  dataStructure,
  depth = 0,
  blockNode,
  options = {}
) => {
  if (!dataStructure) return;
  const padding = paddingStart(depth);
  let ignore = '';
  dataStructure.forEach((statement, index) => {
    switch (statement.$$typeof) {
      case 1: // 基础语句
        /* 处理基础语句下的子语句 */
        /**
         *
         *
         *
         */
        // 假如有声明subtype类型，且类型等于Module【模块】
        // ps: 好像已经没有用了
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
        }
        // 假如没有声明，说明不是导入模块
        // 控制台打印
        else if (
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
        }
        // return【返回】
        else if (
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
        }
        // break【跳出】
        else if (
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
        }
        // Continue【继续】
        else if (
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
        }
        // Sleep【休眠】
        else if (
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
        }
        // var【变量】
        else if (
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

          // 调试测试01
          temp = transformBlockToCode_copy([statement], 0, false).output;
          console.log(`》Var`, temp);
          stepsTemp.list.push({ line: temp , card: statement});


          if (Array.isArray(buffer)) {
            result.output += buffer[0];
          } else {
            result.output += buffer;
          }
        }
        // DIY【自定义代码块】
        else if (
          statement.subtype && // CustomCodeBlockTag
          (statement.subtype & CustomCodeBlockTag) === CustomCodeBlockTag
        ) {
          transformCustomCodeStatement(padding, statement, result, moduleMap);
        }
        // 其他
        else {
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

          // 调试测试02
          temp = transformBlockToCode_copy([statement], 0, false).output;
          console.log(`》Basic`, temp);
          stepsTemp.list.push({ line: temp , card: statement});

          if (Array.isArray(buffer)) {
            result.output += buffer[0];
          } else {
            result.output += buffer;
          }
        }
        result.output += '\n';

        break;
      case 2: // while or for

        // 测试03
        temp = transformLoopStatement(padding, statement, result, options);
        console.log(`》For测试 While测试`, temp);
        stepsTemp.list.push({ line: temp, type: '循环' });

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
      case 4: // if else
        transformConditionalStatement(padding, statement, result);
        ignore = statement.ignore ? '# ' : '';
        if (!statement.ifChildren.length) {
          result.output += `${paddingStart(depth + 1)}${ignore}pass\n`;
        } else {
          transformBlockToCodeImpl(
            statement.ifChildren,
            depth + 1,
            blockNode,
            options
          );
          const ifChildrenIgnoreFlag = statement.ifChildren.every(
            item => item.ignore
          );
          if (ifChildrenIgnoreFlag) {
            result.output += `${paddingStart(depth + 1)}${ignore}pass\n`;
          }
        }

        result.output += `${padding}${ignore}else:\n`;
        if (!statement.elseChildren.length) {
          result.output += `${paddingStart(depth + 1)}${ignore}pass\n`;
        } else {
          transformBlockToCodeImpl(
            statement.elseChildren,
            depth + 1,
            blockNode,
            options
          );
          const elseChildrenIgnoreFlag = statement.elseChildren.every(
            item => item.ignore
          );
          if (elseChildrenIgnoreFlag) {
            result.output += `${paddingStart(depth + 1)}${ignore}pass\n`;
          }
        }
        break;
      case 7: // try catch
        console.log(statement);
        transformCatchStatement(padding, statement, result);
        ignore = statement.ignore ? '#' : '';
        if (!statement.tryChildren.length) {
          result.output += `${paddingStart(depth + 1)}${ignore}pass\n`;
        } else {
          transformBlockToCodeImpl(
            statement.tryChildren,
            depth + 1,
            blockNode,
            options
          );
          const tryChildrenIgnoreFlag = statement.tryChildren.every(
            item => item.ignore
          );
          if (tryChildrenIgnoreFlag) {
            result.output += `${paddingStart(depth + 1)}${ignore}pass\n`;
          }
        }

        result.output += `${padding}${ignore}except Exception as ${
          statement.properties.required.length
            ? statement.properties.required[0].value
            : 'error'
        }:\n`;
        if (!statement.catchChildren.length) {
          result.output += `${paddingStart(depth + 1)}${ignore}pass\n`;
        } else {
          transformBlockToCodeImpl(
            statement.catchChildren,
            depth + 1,
            blockNode,
            options
          );
          const catchChildrenIgnoreFlag = statement.catchChildren.every(
            item => item.ignore
          );
          if (catchChildrenIgnoreFlag) {
            result.output += `${paddingStart(depth + 1)}${ignore}pass\n`;
          }
        }

        result.output += `${padding}${ignore}finally:\n`;
        if (!statement.finallyChildren.length) {
          result.output += `${paddingStart(depth + 1)}${ignore}pass\n`;
        } else {
          transformBlockToCodeImpl(
            statement.finallyChildren,
            depth + 1,
            blockNode,
            options
          );
          const finallyChildrenIgnoreFlag = statement.finallyChildren.every(
            item => item.ignore
          );
          if (finallyChildrenIgnoreFlag) {
            result.output += `${paddingStart(depth + 1)}${ignore}pass\n`;
          }
        }
        break;
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
      .filter(item => item.name && item.value)
      .map(item => paddingStart(depth) + item.name + ' = ' + item.value)
      .join('\n')}\n`;
  }
};

// 转译函数
const transformBlockToCode = (dataStructure, depth = 0, blockNode) => {
  console.log(blockNode);
  result.output = '';
  if (blockNode) {
    transformModuleVariable(result, depth, blockNode.variable || []);
  }
  moduleMap.clear();
  transformBlockToCodeImpl(dataStructure, depth, blockNode, {});
  transformModuleImport(result, moduleMap, depth);
  result.output += `\n` + paddingStart(depth) + 'pass\n';
  if (result.output === '\n' || result.output == '\n\n') {
  }
  return result;
};

export default transformBlockToCode;
