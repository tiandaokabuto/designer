import transformBasicStatement from './transformBasicStatement';

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

const paddingStart = length => '  '.repeat(length);

const result = {
  output: '',
};

const transformBlockToCodeImpl = (dataStructure, depth = 0) => {
  const padding = paddingStart(depth);
  dataStructure.forEach((statement, index) => {
    switch (statement.$$typeof) {
      case 1: // 基础语句
        // result.output += `${padding}${statement.text}\n`;
        transformBasicStatement(statement, result);
        break;
      // case 2: // while
      //   result.output += `${padding}while ( a < 0 ):\n`;
      //   transformBlockToCodeImpl(statement.children, depth + 1);
      //   break;
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

export default dataStructure => {
  result.output = '';
  transformBlockToCodeImpl(dataStructure);
  return result;
};