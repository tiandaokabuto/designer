import React from 'react';
import { message } from 'antd';

import { transformBlockToCode } from '../../containers/designerGraphBlock/RPAcore';
import { fetchCard } from './fetchCard';
import { sendPythonCodeByLine } from './runDebugServer';

export const clickOneStepRun = (cards, id) => {
  const result = transformBlockToCode([fetchCard(cards, id)], 0, false);

  //console.log(`//${id}//`, fetchCard(cards, id)); //cards.filter(item => item.id === id))
  const varNames = fetchCard(cards, id).output;
  //console.log(cards.filter(item => item.id === id));
  let line = result.output//.replace(/\n/g, '\\n');
  //line = line.replace(/\"/, `"`);
  //line = line.replace(/"/g, `\"`);
  // .replace(/"/g, `\"`)
  // .replace(/'/g, `\'`);
  console.log(`【\n=>\\n 且 " => \" 后的python代码】\n`, line);


  //line = 'import GUI'

  if (localStorage.getItem('debug') === '关闭') {
    return message.warning('未打开debug模式');
  }

  try {
    sendPythonCodeByLine({
      varNames: varNames ? varNames : '',
      output: line,
    });

    message.info({
      content: (
        <div style={{ textAlign: 'left', fontSize: 12}}>
          <h3>【代码已发送】 3秒后 窗口自动关闭</h3>
          <textarea
            style={{ minWidth: '80vw', minHeight: '120px' }}
            defaultValue={line}
          ></textarea>
        </div>
      ),
      duration: 3,
      key: 'codeMsg',
      icon: <span></span>,

    });
  } catch (e) {
    console.log(e);
    message.error('debug端口未打开');
  }
};
