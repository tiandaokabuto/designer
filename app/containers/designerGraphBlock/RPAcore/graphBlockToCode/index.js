import transformBasicStatement from './transformBasicStatement';
import transformPrintStatement from './transformPrintStatement';
import transformLoopStatement from './transformLoopStatement';
import { PrintStatementTag } from '../../layout/statementTags';
import { isArray } from './utils';

const fake = [
  {
    $$typeof: 1,
    text: 'basic statement1',
    id: 1,
  },
  {
    $$typeof: 1,
    text: 'basic statement2',
    id: 2,
  },
  {
    $$typeof: 2,
    id: 4,
    children: [
      {
        $$typeof: 1,
        text: 'basic statement4',
        id: 5,
      },
      {
        $$typeof: 2,
        id: 6,
        children: [
          {
            $$typeof: 1,
            text: 'basic statement5',
            id: 7,
          },
          {
            $$typeof: 4,
            ifChildren: [
              {
                $$typeof: 1,
                text: 'basic statement6----if',
                id: 8,
              },
            ],
            elseChildren: [
              {
                $$typeof: 1,
                text: 'basic statement7----else',
                id: 9,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    $$typeof: 1,
    text: 'basic statement3',
    id: 3,
  },
];

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
          (statement.subtype & PrintStatementTag) == PrintStatementTag
        ) {
          transformPrintStatement(padding, statement, result);
        } else {
          transformBasicStatement(padding, statement, result, moduleMap);
        }
        result.output += '\n';
        break;
      case 2: // while or for
        transformLoopStatement(padding, statement, result);
        result.output += `${padding}while ( a < 0 ):\n`;
        transformBlockToCodeImpl(statement.children, depth + 1);
        break;
      // case 4: // 条件语句
      //   result.output += `${padding}if ( b > 0 ):\n`;
      //   transformBlockToCodeImpl(statement.ifChildren, depth + 1);

      //   result.output += `${padding}else:\n`;
      //   transformBlockToCodeImpl(statement.elseChildren, depth + 1);
      //   break;
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

export default dataStructure => {
  result.output = '';
  moduleMap.clear();
  transformBlockToCodeImpl(dataStructure, 0);
  transformModuleImport(result, moduleMap);

  return result;
};
