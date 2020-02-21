import transformBasicStatement from './transformBasicStatement';
import transformPrintStatement from './transformPrintStatement';
import transformLoopStatement from './transformLoopStatement';
import transformConditionalStatement from './transformConditionalStatement';
import transformReturnStatement from './transformReturnStatement';
import {
  PrintStatementTag,
  ReturnStatementTag,
} from '../../layout/statementTags';
import { isArray } from './utils';

// const fake = [
//   {
//     $$typeof: 1,
//     text: 'basic statement1',
//     id: 1,
//   },
//   {
//     $$typeof: 1,
//     text: 'basic statement2',
//     id: 2,
//   },
//   {
//     $$typeof: 2,
//     id: 4,
//     children: [
//       {
//         $$typeof: 1,
//         text: 'basic statement4',
//         id: 5,
//       },
//       {
//         $$typeof: 2,
//         id: 6,
//         children: [
//           {
//             $$typeof: 1,
//             text: 'basic statement5',
//             id: 7,
//           },
//           {
//             $$typeof: 4,
//             ifChildren: [
//               {
//                 $$typeof: 1,
//                 text: 'basic statement6----if',
//                 id: 8,
//               },
//             ],
//             elseChildren: [
//               {
//                 $$typeof: 1,
//                 text: 'basic statement7----else',
//                 id: 9,
//               },
//             ],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     $$typeof: 1,
//     text: 'basic statement3',
//     id: 3,
//   },
// ];

const paddingStart = length => '    '.repeat(length);

const result = {
  output: '',
};

const moduleMap = new Map();

const transformBlockToCodeImpl = (dataStructure, depth = 0) => {
  const padding = paddingStart(depth);
  dataStructure.forEach((statement, index) => {
    switch (statement.$$typeof) {
      case 1: // 基础语句
        /* 处理基础语句下的子语句 */
        if (
          statement.subtype &&
          (statement.subtype & PrintStatementTag) === PrintStatementTag
        ) {
          transformPrintStatement(padding, statement, result);
        } else if (
          statement.subtype &&
          (statement.subtype & ReturnStatementTag) === ReturnStatementTag
        ) {
          transformReturnStatement(padding, statement, result);
        } else {
          transformBasicStatement(padding, statement, result, moduleMap);
        }
        result.output += '\n';
        break;
      case 2: // while or for
        transformLoopStatement(padding, statement, result);
        transformBlockToCodeImpl(statement.children, depth + 1);
        break;
      case 4:
        transformConditionalStatement(padding, statement, result);
        if (!statement.ifChildren.length) {
          result.output += `${paddingStart(depth + 1)}pass\n`;
        } else {
          transformBlockToCodeImpl(statement.ifChildren, depth + 1);
        }

        result.output += `${padding}else:\n`;
        if (!statement.elseChildren.length) {
          result.output += `${paddingStart(depth + 1)}pass\n`;
        } else {
          transformBlockToCodeImpl(statement.elseChildren, depth + 1);
        }
      default:
      // do nothing
    }
  });
};

const transformModuleImport = (result, moduleMap) => {
  let prefix = '';
  for (const [moduleName, pkg] of moduleMap) {
    prefix += `from ${moduleName} import ${
      isArray(pkg) ? pkg.join(',') : pkg
    }\n`;
  }
  result.output = prefix + '\n' + result.output;
};

export default (dataStructure, depth = 0) => {
  result.output = '';
  moduleMap.clear();
  transformBlockToCodeImpl(dataStructure, depth);
  transformModuleImport(result, moduleMap);

  return result;
};
