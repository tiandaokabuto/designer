import React from 'react';
import { message } from 'antd';

import { transformBlockToCode } from '../../containers/designerGraphBlock/RPAcore';
import { fetchCard, resetTemp } from './fetchCard';
import { sendPythonCodeByLine } from './runDebugServer';

export const clickOneStepRun = (card, pk ,spLine = null) => {
  let line;

  if (!spLine) {
    const result = transformBlockToCode([card], 0, false);
    line = result.output;
  } else {
    line = spLine;
  }

  console.log(`【\n=>\\n 且 " => \" 后的python代码】\n`, line);

  try {
    // 假如是正常卡片，则需要找一下输出到，和变量名称
    // 假如是判断语句，则不需要
    const findVarNames = spLine
      ? ''
      : card.properties.required.find(
          item => item.cnName === '输出到' || item.cnName === '变量名称'
        );

    if(!card){
      card = {funcName:"debug_main"}
    }

    sendPythonCodeByLine({
      running: card,
      varNames: findVarNames ? findVarNames.value : '',
      output: line,
      pk:pk
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
