import React from 'react';
import { message } from 'antd';

// import { transformBlockToCode } from '../../containers/designerGraphBlock/RPAcore';
import {
  default as transformBlockToCode,
  getStepsTemp,
} from '../../containers/designerGraphBlock/RPAcore/graphBlockToCode/forDebug';

import { fetchCard, resetTemp } from './fetchCard';
import { sendPythonCodeByLine } from './runDebugServer';

import store from '@/store';

let stepTemp = {
  stepList: [],
  stepIndex: 0,
  type: '',
};

export const clickOneStepRun = (cards, id) => {
  resetTemp();
  console.log(`fetchCard找子卡片`, cards, id);

  const card = fetchCard(cards, id);
  console.log(`开始遍历fetchCard`, card);
  const result = transformBlockToCode([card], 0, false);
  console.log(`得到代码`, result);

  console.log(`》得到拆解后的代码`, getStepsTemp());
  let stepsTemp = getStepsTemp();

  //console.log(`//${id}//`, fetchCard(cards, id)); //cards.filter(item => item.id === id))
  //console.log(cards.filter(item => item.id === id));

  let line = result.output; //.replace(/\n/g, '\\n');
  //line = line.replace(/\"/, `"`);
  //line = line.replace(/"/g, `\"`);
  // .replace(/"/g, `\"`)
  // .replace(/'/g, `\'`);
  console.log(`【\n=>\\n 且 " => \" 后的python代码】\n`, line);

  const switchOn = store.getState().debug.switch;

  if (!switchOn) {
    return message.warning('未打开debug模式');
  }

  stepsTemp.list.forEach((line, index) => {
    console.log(line);
  });

  // stepsTemp[0]
  // const findVarNames = card.properties.required.find(
  //   item => item.cnName === '输出到' || item.cnName === '变量名称'
  // );
  sendPythonCodeByLine({
    running: stepsTemp.list[0].card ? stepsTemp.list[0].line : {},
    varNames: '', //findVarNames ? findVarNames.value : '',
    output: stepsTemp.list[0].line,
  });

  /**
  try {
    const findVarNames = card.properties.required.find(
      item => item.cnName === '输出到' || item.cnName === '变量名称'
    );
    sendPythonCodeByLine({
      running: card,
      varNames: findVarNames ? findVarNames.value : '',
      output: line,
    });

    // 用来调试看代码的
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
   */
};
