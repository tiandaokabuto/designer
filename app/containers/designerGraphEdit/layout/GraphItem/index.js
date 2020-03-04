import React from 'react';
import { Icon } from 'antd';

import ProcessTree from './components/ProcessTree';

// const projectlist = [
//   {
//     title: '目录1',
//     key: '0-0',
//     icon: generateIcon('hdd'),
//     children: [
//       {
//         description: 'openBrowser',
//         key: '0-0-0',
//         item: {
//           text: '自定义文本流程一',
//         },
//         icon: generateIcon('branches'),
//       },
//       {
//         description: 'openBrowser',
//         key: '0-0-1',
//         item: {
//           text: '自定义文本流程二',
//         },
//         icon: generateIcon('branches'),
//       },
//     ],
//   },
//   {
//     title: '目录2',
//     key: '0-1',
//     icon: generateIcon('hdd'),
//     children: [],
//   },
// ];
export default () => {
  return (
    <div className="designergraph-item">
      <div className="designergraph-item-title">我的项目</div>
      <ProcessTree />
      {/* <Tree>{renderTreeNodes(processTree)}</Tree> */}
    </div>
  );
};
