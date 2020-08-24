import React from 'react';
import { message } from 'antd';

import { transformBlockToCode } from '../../containers/designerGraphBlock/RPAcore';
import { fetchCard, resetTemp } from './fetchCard';
import { sendPythonCodeByLine } from './runDebugServer';

import store from '@/store';

export const clickOneStepRun = (cards, id) => {
  resetTemp();

  const result = transformBlockToCode([fetchCard(cards, id)], 0, false);

  //console.log(`//${id}//`, fetchCard(cards, id)); //cards.filter(item => item.id === id))

  const varNames = fetchCard(cards, id);
  console.log(cards,id,varNames)
  //console.log(cards.filter(item => item.id === id));
  let line = result.output//.replace(/\n/g, '\\n');
  //line = line.replace(/\"/, `"`);
  //line = line.replace(/"/g, `\"`);
  // .replace(/"/g, `\"`)
  // .replace(/'/g, `\'`);
  console.log(`【\n=>\\n 且 " => \" 后的python代码】\n`, line);


  const switchOn = store.getState().debug.switch;

  if (!switchOn) {
    return message.warning('未打开debug模式');
  }

  try {
    sendPythonCodeByLine({
      varNames: varNames.outPut ? varNames.outPut : '',
      output: line,
    });

    // message.loading({
    //   content: (
    //     <div style={{ textAlign: 'left', fontSize: 12}}>
    //       <h3>【代码已发送】 2秒后 窗口自动关闭</h3>
    //       <textarea
    //         style={{ minWidth: '80vw', minHeight: '120px' }}
    //         defaultValue={line}
    //       ></textarea>
    //     </div>
    //   ),
    //   key:"pythonCode",
    //   duration: 2,
    //   icon: <span></span>,

    // });
  } catch (e) {
    console.log(e);
    message.error('debug端口未打开');
  }
};
