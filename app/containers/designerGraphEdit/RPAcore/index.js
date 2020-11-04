import uniqueId from 'lodash/uniqueId';
import cloneDeep from 'lodash/cloneDeep';
import { message } from 'antd';
import {
  findStartNode,
  findTargetIdBySourceId,
  findNodeById,
  findNodeByLabelAndId,
  isCircleExist,
  findCommonTarget,
  hasTwoEntryPoint,
  hasTwoEntryPortInProcessBlock,
  findStartProcessBlockInContain,
  findCatchFinallyNode,
  translateGroup,
} from '_utils/RPACoreUtils/GraphEdit/utils';

import { writeFileRecursive } from '../../../nodejs';

import { transformBlockToCode } from '../../designerGraphBlock/RPAcore';
import { updateEditorBlockPythonCode } from '../../reduxActions';

// liuqi
// 循环
import transformLoopStatement from '../../designerGraphBlock/RPAcore/graphBlockToCode/transformLoopStatement';
// 判断
import transformConditionalStatement from '../../designerGraphBlock/RPAcore/graphBlockToCode/transformConditionalStatement';
// 异常
//import {transformCatchStatement} from '../../designerGraphBlock/RPAcore/graphBlockToCode/transformCatchStatement';

import { sendPythonCodeByLine } from '../../../utils/DebugUtils/runDebugServer';
import event from '../../eventCenter';
import { clickOneStepRun } from '../../../utils/DebugUtils/clickOneStepRun';

// liuqi-new
import {
  DEBUG_SET_BTN_CAN_BE_PASUE,
  DEBUG_SET_BTN_CAN_BE_CONTINUE,
  //
  DEBUG_RUN_BLOCK_CHANGE_STATE_PAUSED,
  DEBUG_RUN_BLOCK_CHANGE_STATE_END,
  //
  DEBUG_RUN_CARDS_CHANGE_STATE_PAUSED,
  DEBUG_RUN_CARDS_CHANGE_STATE_END,
  // 存入DEBUG的源代码
  DEBUG_PUT_SOURCECODE,
} from '../../../constants/actions/debugInfos';
import { changeDebugInfos } from '../../../containers/reduxActions';

const padding = length => '    '.repeat(length);

// 以流程块为最小单元的缓冲区
let tempCenter = [];
// 以流程图构成的索引执行路径
let mxgraphTempCenter = [];
let pointOfBlock = [];

let nowIndex = 0;

// 卡片的指针
let pointOfCard = undefined;
let spPointer = [];
let spResult = { pk: undefined, tempLine: '', result: undefined };

let nowLevel = 'block';
let pass = false;
let isPause = false;

// 清空代码分段缓存区
export const claerTempCenter = () => {
  tempCenter = [];

  // 新版指针
  mxgraphTempCenter = [];
  pointOfBlock = [];

  // 新版指针
  pointOfCard = undefined;
  spPointer = [];
  spResult = { pk: undefined, result: undefined };

  pass = false;
  isPause = false;
  nowLevel = 'block';
};

// 传入pk卡片指针值为 pointOfCard
const getNextIndexCards = (cards, pk) => {
  console.log('当前准备找下一个指针的', pk);

  let nextPk = [];
  let nowCard; // 单数层，卡片
  let nowCards; // 双数层，儿子组
  let nowIndex;
  let fatherPk;
  let fatherCards;

  if (!pk) {
    if (cards.length > 0) {
      return [0];
    } else {
      message.info('未检测到代码');
      return undefined;
    }
  }

  // 假如是指针长度为1,3,5,7,则指针在卡片上
  // 详情见说明文档

  if (pk.length % 2 === 1) {
    nowCard = getCardsByPk(cards, pk);
    nowIndex = pk[0];

    if (pk.length === 1 && !nowCard.hasChildren) {
      // 假如只有一层，则fatherCard不存在
      // 直接检查cards
      if (pk < cards.length - 1) {
        return [nowIndex + 1];
      } else {
        return [];
      }
    }

    // 01 取出当前层下标
    nowIndex = pk.slice(-1)[0];
    // 01-1 当前卡片
    nowCard = getCardsByPk(cards, pk);

    // 02 取出父级层下标
    fatherPk = pk.slice(0, -1);
    // 02-2 父级卡组
    fatherCards = getCardsByPk(cards, fatherPk);

    // 条件1  假如这个指针指向的没有元素，例如 ifChildren=[]
    //        则指正切回上层
    if (!nowCard) {
      nowIndex = fatherPk.slice(-1)[0];
      fatherPk = fatherPk.slice(0, -1);
      return [...fatherPk, nowIndex + 1];
    }

    // [卡片层] 分辨  B,  A
    // B 嵌套容器
    // ---------------------------则直接进下一层第一个卡片
    if (nowCard.hasChildren && nowCard.hasChildren.length > 0) {
      return [...pk, 0];
    }

    // A 正常卡片
    // ---------------------------正常卡片是下一个是下标+1

    // 条件2  判断父层下标是否到达该层尾部
    //        假如没有到尾部，则下标+1
    if (nowIndex < fatherCards.length - 1) {
      return [...fatherPk, nowIndex + 1];
    }
    // 否则条件3  指针到达尾部，则需要跳出这一层
    //            和上面条件1同理
    else {
      nowIndex = fatherPk.slice(-1)[0];
      fatherPk = fatherPk.slice(0, -1);
      return [...fatherPk, nowIndex + 1];
    }
  }
  // 假如是 0,2,4,6,8...位置
  else {
    // 03 取出当前层下标
    nowIndex = pk.slice(-1)[0];
    // 03-1 当前卡儿子组
    nowCards = getCardsByPk(cards, pk);

    // // 04 取出父级层下标
    fatherPk = pk.slice(0, -1);
    // // 04-1 父级卡组
    // fatherCards = getCardsByPk(fatherPk);

    // 条件1  假如这个指针指向的没有这个儿子组
    //        则说明已经到嵌套体的尾部，则要调用首条
    if (!nowCards) {
      return [...fatherPk, 0];
    } else {
      return [...pk, 0];
    }
  }
};

// 用指针获取card/cards
const getCardsByPk = (cards, pk) => {
  try {
    if (pk.length < 1) {
      return undefined;
    }
  } catch (e) {
    message.info('指针异常');
    return undefined;
  }

  let temp = undefined;
  try {
    if (pk.length === 1) {
      return cards[pk[0]];
    }

    for (let pos = 0; pos < pk.length; pos++) {
      if (pos === 0) {
        temp = cards[pk[0]];
      } else {
        if (pos % 2 === 1) {
          temp = temp[temp.hasChildren[pk[pos]]]; // 中
        } else {
          temp = temp[pk[pos]]; // 尾
        }
      }
    }
  } catch (e) {
    //message.info('指针异常');
    console.log(e);
  }
  return temp;
};

export const getDebugIndex = () => {
  return {
    nowIndex: nowIndex,
    nowIndexCards: [],
    nowLevel: nowLevel,
  };
};

// 获取代码分段缓存区的内容
export const getTempCenter = () => {
  changeDebugInfos(DEBUG_PUT_SOURCECODE, tempCenter);
  return tempCenter;
};

export const setPause = () => {
  isPause = true;
  message.info('已下发暂停指令，请稍等一会');
  return {
    tempCenter,
    // nowIndex,
    // nowIndexCards,
    pass,
    isPause,
  };
};

export const clearPause = () => {
  isPause = false;
  return {
    tempCenter,
    // nowIndex,
    // nowIndexCards,
    pass,
    isPause,
  };
};

// 设置拦截器判断结果
export const set_spResult = result => {
  if (result) {
    spResult.result = '通过';
  } else {
    spResult.result = '不通过';
  }
};

export const get_spResult = () => {
  return spResult;
};

// 双数层的操作 0.2 [只管执行]
const blockRun_0_2_doubleFloor_pointRun = (cards, nextPk) => {
  return new Promise((resolve, reject) => {
    let fatherCard = getCardsByPk(cards, nextPk.slice(0, -1)); // 找到这个容器的属性
    let nowIndex = nextPk.slice(-1)[0];
    let tempLine;

    setTimeout(() => {
      // 设置判别点信息
      let saveObj = {
        pk: nextPk,
        line: tempLine,
        //type: 'for',
        check: undefined,
      };
      switch (fatherCard.$$typeof) {
        case 2:
          tempLine = fatherCard.tempLine; //transformLoopStatement('', fatherCard, { output: '' }, {});
          saveObj.type = 'for';
          break;
        case 4:
          tempLine = fatherCard.tempLine;
          saveObj.type = 'if';
          break;
        case 7:
          break;
      }

      console.log(`[[重要]]`, tempLine);
      clickOneStepRun(undefined, nextPk, tempLine + `:\n`);
      pointOfBlock = nextPk; // 更新指针

      // 存储拦截器
      if (!spPointer.find(item => item.pk === nextPk.slice(0, -1))) {
        spPointer.push(saveObj);
      }

      spResult.pk = [...nextPk, 0];
      spResult.tempLine = tempLine;
      spResult.result = undefined;

      let tempString = [...nextPk]
        .reduce((pre, no) => {
          return pre + (no + 1).toString() + `-`;
        }, '')
        .slice(0, -1);
      message.info(`当前运行${tempString}  ,  ${tempLine}`);
      resolve('成功！');
    }, 300);
  });
};

// 单数层的操作 0.2
const blockRun_0_2_singleFloor_pointRun = (cards, nextPk, nextCard) => {
  return new Promise((resolve, reject) => {
    // setTimeout(() => {
    //   clickOneStepRun(nextCard, nextPk);
    //   pointOfCard = nextPk;
    //   let tempString = [...nextPk]
    //     .reduce((pre, no) => {
    //       return pre + (no + 1).toString() + `-`;
    //     }, '')
    //     .slice(0, -1);
    //   message.info(`当前运行${tempString}`);
    //   resolve('成功');
    // }, 300);
    const running = tempCenter.find(
      block => block.currentId === nextCard.currentId
    );

    if (!running) {
      return '遇到故障';
    }

    running.funcName = 'debug_main';
    console.log(`running`, running);

    let tempString = [...nextPk]
      .reduce((pre, no) => {
        return pre + (no + 1).toString() + `-`;
      }, '')
      .slice(0, -1);

    if (pass === true) {
      // 执行
      setTimeout(() => {
        sendPythonCodeByLine({
          running: running,
          varNames: running.return_string,
          // varNames: findVarNames ? findVarNames.value : '',
          output: running.__main__,
          pk: nextPk,
        });
        //nowIndex += 1;
        pointOfBlock = [...nextPk];

        message.info(`当前运行${tempString}`);
      }, 300);
      pass = false;
      resolve('成功');
    } else {
      setTimeout(() => {
        sendPythonCodeByLine({
          running: running,
          varNames: '', //running.return_string,
          //varNames: findVarNames ? findVarNames.value : '',
          output: running.pythonCode,
          pk: nextPk,
        });
      }, 300);
      pass = true;
      resolve('成功');
    }
  });
};

// // 【 block的单步调试 - 0.2版 】开始第一层卡片级，逐步发送
export const blockRun_0_2_ver = async (callback, withoutNext = false) => {
  nowLevel = 'block';
  // 01 检查暂停
  if (isPause) {
    changeDebugInfos(DEBUG_SET_BTN_CAN_BE_CONTINUE, {});
    changeDebugInfos(DEBUG_RUN_CARDS_CHANGE_STATE_PAUSED, {}); // 'cardsAll_pause'
    return message.info('进程被暂停');
  }

  // 02-1 获取当前需要的所有卡片
  const cards = mxgraphTempCenter;

  // 02-2 假如没有找到流程块，则转义失败，不执行
  if (!cards) {
    changeDebugInfos(DEBUG_RUN_CARDS_CHANGE_STATE_END, {});
    return message.warning('这个流程块没有被正确连线到流程中，请检查连线关系');
  }

  // 03 流程块内没有卡片
  if (cards.length < 1) {
    changeDebugInfos(DEBUG_RUN_CARDS_CHANGE_STATE_END, {});
    return message.warning('无代码块可以运行');
  }

  // 准备阶段： A 拿下一个指针  B 取这个指针的卡片
  let nextPk = withoutNext
    ? pointOfBlock
    : getNextIndexCards(cards, pointOfBlock);
  let nextCard = getCardsByPk(cards, nextPk);
  let fatherCard = undefined;
  let nowIndex = undefined;

  // 断点检查
  if (!pointOfBlock) {
    if (nextCard.breakPoint === true) {
      message.info('流程块第1条遇到断点');
      setPause();
      nextCard.breakPoint = false;
      changeDebugInfos(DEBUG_SET_BTN_CAN_BE_CONTINUE, {});
      changeDebugInfos(DEBUG_RUN_CARDS_CHANGE_STATE_PAUSED, {}); // 'cardsAll_pause'
      return;
    }
  }

  if (nextCard) {
    const next_nextCard = getNextIndexCards(
      cards,
      getNextIndexCards(cards, nextPk)
    );
    if (next_nextCard) {
      // 他有下一条存在
      if (next_nextCard.breakPoint === true) {
        message.info('发现了1个断点');
        setPause();
      }
    }
  }

  // 04 结束：下一个指针属于第一层，而且已经没有卡片，
  if (nextPk.length === 0 || (nextPk.length === 1 && !nextCard)) {
    pointOfBlock = undefined;
    changeDebugInfos(DEBUG_RUN_CARDS_CHANGE_STATE_END, {});
    return message.success('流程块已完成');
  }

  // 05-1 假如指针是奇数，则指向的是card卡片
  if (nextPk.length % 2 === 1) {
    // 05-1-0 判断拦截器
    // 取出两者指针
    console.log(`spResult`, spResult, nextPk);
    const spResult_pk_string = spResult.pk
      ? spResult.pk.reduce((pre, index) => (pre += index.toString()), '')
      : 'no';
    const nextPk_string = nextPk
      ? nextPk.reduce((pre, index) => (pre += index.toString()), '')
      : 'empty';

    if (spResult_pk_string === nextPk_string) {
      console.log(
        '检查拦截器',
        spResult_pk_string,
        nextPk_string,
        nextPk,
        spResult.result
      );

      if (spResult.result === '通过') {
        // for 通过的话，继续执行
        // if 通过的话，继续执行
        spResult.result = undefined;
      } else if (spResult.result === '不通过') {
        fatherCard = getCardsByPk(cards, nextPk.slice(0, -2));
        console.log(`检查拦截器`, fatherCard);
        // for 不通过的话，跳出循环体，father指针的下一个
        if (fatherCard.$$typeof === 2) {
          pointOfBlock = [...nextPk.slice(0, -3), nextPk.slice(-3, -2)[0] + 1];
          console.log('errorPoint', pointOfBlock);

          return callback(blockRun_0_2_ver, true);
        }
        // if 不通过的话，则跳转指针到[...xxx,1,0] 就是else指针上的第1个元素，同时
        // 重新取一下nextCard用于下面判断
        else if (fatherCard.$$typeof === 4) {
          pointOfBlock = [...nextPk.slice(0, -2), 1, 0];

          console.log('errorPoint', pointOfBlock);

          return callback(blockRun_0_2_ver, true);
        } else if (fatherCard.$$typeof === 7) {
        }

        spResult.result = undefined;
      }
    }

    // 05-1-1 先判断卡片是否存在
    if (!nextCard) {
      // 假如卡片不存在，则改下一个指针回调
      pointOfBlock = nextPk;
      return callback(blockRun_0_2_ver);
    }

    //console.log(`console.log(nextCard)`,nextPk,nextCard)

    // 05-1-2 判断有无children
    // 05-1-2-1 假如没有children，则是一个正常的card
    if (!nextCard.hasChildren) {
      return await blockRun_0_2_singleFloor_pointRun(cards, nextPk, nextCard);
    }
    // 05-1-2-1 假如有children，执行判断语句
    else {
      // 跳过有children的父指针，这里赋值与否无关系，重点是要取这个father的下一层指针
      if (nextCard.$$typeof === 7) {
        pointOfBlock = nextPk;
        nextPk = getNextIndexCards(cards, pointOfBlock);
        pointOfBlock = nextPk;

        return callback(blockRun_0_2_ver);
      }
      pointOfBlock = nextPk;
      nextPk = getNextIndexCards(cards, pointOfBlock);
      return await blockRun_0_2_doubleFloor_pointRun(cards, nextPk);
    }
  }
  // 05-2 否则偶数，则指向的是 体 的children组，要执行的是发送判断体信息
  else {
    // 05-2-1 找到这个双层卡的父Card，就是循环体或者判断体的本体card
    fatherCard = getCardsByPk(cards, nextPk.slice(0, -1));
    nowIndex = nextPk.slice(-1)[0];

    // 05-2-2 特殊判断
    // 05-2-2-1 循环体
    if (fatherCard.$$typeof === 2) {
      // 05-2-2-1-1 假如已经到底，则回去重新执行循环头
      if (nowIndex === 1) {
        // 改指针到头部
        pointOfBlock = nextPk;
        return callback(blockRun_0_2_ver);
      }
    }
    // 05-2-2-2 判断体
    if (fatherCard.$$typeof === 4) {
      // 05-2-2-2-1 假如已经到 if 或者 else 的底部
      if (nowIndex === 1 || nowIndex === 2) {
        // 跳出判断体
        pointOfBlock = [...nextPk.slice(0, -2), nextPk.slice(-2, -1)[0] + 1];
        // withoutNext 指针已经跳转到下一个了，不需要开始的时候再重新获取指针
        return callback(blockRun_0_2_ver, true);
      }
    }

    if (fatherCard.$$typeof === 7) {
      // 05-2-2-2-1 假如已经到 try 底部 Catch 底部
      if (nowIndex === 1 || nowIndex === 2) {
        // 跳入finally
        pointOfBlock = [...nextPk.slice(0, -1), 2, 0];
        // withoutNext 指针已经跳转到下一个了，不需要开始的时候再重新获取指针
        return callback(blockRun_0_2_ver, true);
      } else if (nowIndex === 3) {
        // 跳出tryCatch体
        pointOfBlock = [...nextPk.slice(0, -2), nextPk.slice(-2, -1)[0] + 1];
        // withoutNext 指针已经跳转到下一个了，不需要开始的时候再重新获取指针
        return callback(blockRun_0_2_ver, true);
      }
    }

    await blockRun_0_2_doubleFloor_pointRun(cards, nextPk);
  }
};

// 双数层的操作 0.2 [只管执行]
const cardsRun_0_2_doubleFloor_pointRun = (cards, nextPk) => {
  return new Promise((resolve, reject) => {
    let fatherCard = getCardsByPk(cards, nextPk.slice(0, -1)); // 找到这个容器的属性
    let nowIndex = nextPk.slice(-1)[0];
    let tempLine;

    setTimeout(() => {
      // 设置判别点信息
      let saveObj = {
        pk: nextPk,
        line: tempLine,
        //type: 'for',
        check: undefined,
      };
      switch (fatherCard.$$typeof) {
        case 2:
          tempLine = transformLoopStatement('', fatherCard, { output: '' }, {});
          saveObj.type = 'for';
          break;
        case 4:
          tempLine = transformConditionalStatement(
            '',
            fatherCard,
            { output: '' },
            {}
          );
          saveObj.type = 'if';
          break;
        case 7:
          break;
      }

      console.log(`[[重要]]`, tempLine);
      clickOneStepRun(fatherCard, nextPk, tempLine);
      pointOfCard = nextPk; // 更新指针

      // 存储拦截器
      if (!spPointer.find(item => item.pk === nextPk.slice(0, -1))) {
        spPointer.push(saveObj);
      }

      spResult.pk = [...nextPk, 0];
      spResult.tempLine = tempLine;
      spResult.result = undefined;

      let tempString = [...nextPk]
        .reduce((pre, no) => {
          return pre + (no + 1).toString() + `-`;
        }, '')
        .slice(0, -1);
      message.info(`当前运行${tempString}  ,  ${tempLine}`);
      resolve('成功！');
    }, 300);
  });
};

// 单数层的操作 0.2
const cardsRun_0_2_singleFloor_pointRun = (cards, nextPk, nextCard) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      clickOneStepRun(nextCard, nextPk);
      pointOfCard = nextPk;
      let tempString = [...nextPk]
        .reduce((pre, no) => {
          return pre + (no + 1).toString() + `-`;
        }, '')
        .slice(0, -1);
      message.info(`当前运行${tempString}`);
      resolve('成功');
    }, 300);
  });
};

// // 【 editor的单步调试 - 0.2版 】开始第二层卡片级，逐步发送
export const cardsRun_0_2_ver = async (
  checkedGraphBlockId,
  callback,
  withoutNext = false
) => {
  nowLevel = 'cards';
  // 01 检查暂停
  if (isPause) {
    changeDebugInfos(DEBUG_SET_BTN_CAN_BE_CONTINUE, {});
    changeDebugInfos(DEBUG_RUN_CARDS_CHANGE_STATE_PAUSED, {}); // 'cardsAll_pause'
    return message.info('进程被暂停');
  }

  // 02-1 找到当前使用的流程块
  const findProcess = tempCenter.find(block => {
    return block.currentId === checkedGraphBlockId;
  });
  // 02-2 假如没有找到流程块，则转义失败，不执行
  if (!findProcess) {
    changeDebugInfos(DEBUG_RUN_CARDS_CHANGE_STATE_END, {});
    return message.warning('这个流程块没有被正确连线到流程中，请检查连线关系');
  }
  // 02-3 （假如有代码）把流程块中的卡片组取出来
  const cards = findProcess.cards;

  // 03 流程块内没有卡片
  if (cards.length < 1) {
    changeDebugInfos(DEBUG_RUN_CARDS_CHANGE_STATE_END, {});
    return message.warning('无代码块可以运行');
  }

  // 准备阶段： A 拿下一个指针  B 取这个指针的卡片
  let nextPk = withoutNext
    ? pointOfCard
    : getNextIndexCards(cards, pointOfCard);
  let nextCard = getCardsByPk(cards, nextPk);
  let fatherCard = undefined;
  let nowIndex = undefined;
  let prepareNext = undefined;
  let next_nextCard = undefined;

  // 断点检查
  if (!pointOfCard) {
    if (nextCard.breakPoint === true) {
      message.info('流程块第1条遇到断点');
      setPause();
      nextCard.breakPoint = false;
      changeDebugInfos(DEBUG_SET_BTN_CAN_BE_CONTINUE, {});
      changeDebugInfos(DEBUG_RUN_CARDS_CHANGE_STATE_PAUSED, {}); // 'cardsAll_pause'
      return;
    }
  }

  if (nextCard && nextCard.length > 1) {
    console.log(`【重点关注！当前运行的】`, nextPk, nextCard);
    if (nextPk.length % 2 === 0) {
      // 假如现在是偶数位，则const
      next_nextCard = getCardsByPk(cards, getNextIndexCards(cards, nextPk));
    } else {
      next_nextCard = getCardsByPk(
        cards,
        getNextIndexCards(cards, getNextIndexCards(cards, nextPk))
      );
    }

    if (next_nextCard) {
      console.log(
        `【重点关注！下一条】`,
        getNextIndexCards(cards, nextPk),
        next_nextCard,
        next_nextCard.breakPoint
      );
      // 他有下一条存在

      if (next_nextCard.breakPoint === true) {
        message.info('发现了1个断点');
        setPause();
      }
    }
  } else {
    next_nextCard = getCardsByPk(cards, getNextIndexCards(cards, nextPk));
    if (next_nextCard) {
      console.log(
        `【重点关注单层元素的break】`,
        getNextIndexCards(cards, nextPk),
        next_nextCard,
        next_nextCard.breakPoint
      );
      // 他有下一条存在

      if (next_nextCard.breakPoint === true) {
        message.info('发现了1个断点');
        setPause();
      }
    }
  }

  console.log(`[到底了]nextPk`, nextPk, nextCard);
  // 04 结束：下一个指针属于第一层，而且已经没有卡片，
  if (nextPk.length === 0 || (nextPk.length === 1 && !nextCard)) {
    pointOfCard = undefined;
    changeDebugInfos(DEBUG_RUN_CARDS_CHANGE_STATE_END, {});
    return message.success('流程块已完成');
  }

  // 05-1 假如指针是奇数，则指向的是card卡片
  if (nextPk.length % 2 === 1) {
    // 05-1-0 判断拦截器
    // 取出两者指针
    console.log(`spResult`, spResult, nextPk);
    const spResult_pk_string = spResult.pk
      ? spResult.pk.reduce((pre, index) => (pre += index.toString()), '')
      : 'no';
    const nextPk_string = nextPk
      ? nextPk.reduce((pre, index) => (pre += index.toString()), '')
      : 'empty';

    if (spResult_pk_string === nextPk_string) {
      console.log(
        '检查拦截器',
        spResult_pk_string,
        nextPk_string,
        nextPk,
        spResult.result
      );

      if (spResult.result === '通过') {
        // for 通过的话，继续执行
        // if 通过的话，继续执行
        spResult.result = undefined;
      } else if (spResult.result === '不通过') {
        fatherCard = getCardsByPk(cards, nextPk.slice(0, -2));
        console.log(`检查拦截器`, fatherCard);
        // for 不通过的话，跳出循环体，father指针的下一个
        if (fatherCard.$$typeof === 2) {
          pointOfCard = [...nextPk.slice(0, -3), nextPk.slice(-3, -2)[0] + 1];
          console.log('errorPoint', pointOfCard);
          return callback(checkedGraphBlockId, cardsRun_0_2_ver, true);
        }
        // if 不通过的话，则跳转指针到[...xxx,1,0] 就是else指针上的第1个元素，同时
        // 重新取一下nextCard用于下面判断
        else if (fatherCard.$$typeof === 4) {
          pointOfCard = [...nextPk.slice(0, -2), 1, 0];
          console.log('errorPoint', pointOfCard);
          return callback(checkedGraphBlockId, cardsRun_0_2_ver, true);
        } else if (fatherCard.$$typeof === 7) {
        }

        spResult.result = undefined;
      }
    }

    // 05-1-1 先判断卡片是否存在
    if (!nextCard) {
      // 假如卡片不存在，则改下一个指针回调
      pointOfCard = nextPk;
      return callback(checkedGraphBlockId, cardsRun_0_2_ver);
    }

    //console.log(`console.log(nextCard)`,nextPk,nextCard)

    // 05-1-2 判断有无children
    // 05-1-2-1 假如没有children，则是一个正常的card
    if (!nextCard.hasChildren) {
      return await cardsRun_0_2_singleFloor_pointRun(cards, nextPk, nextCard);
    }
    // 05-1-2-1 假如有children，执行判断语句
    else {
      // 跳过有children的父指针，这里赋值与否无关系，重点是要取这个father的下一层指针
      if (nextCard.$$typeof === 7) {
        pointOfCard = nextPk;
        nextPk = getNextIndexCards(cards, pointOfCard);
        pointOfCard = nextPk;

        return callback(checkedGraphBlockId, cardsRun_0_2_ver);
      }
      pointOfCard = nextPk;
      nextPk = getNextIndexCards(cards, pointOfCard);
      return await cardsRun_0_2_doubleFloor_pointRun(cards, nextPk);
    }
  }
  // 05-2 否则偶数，则指向的是 体 的children组，要执行的是发送判断体信息
  else {
    // 05-2-1 找到这个双层卡的父Card，就是循环体或者判断体的本体card
    fatherCard = getCardsByPk(cards, nextPk.slice(0, -1));
    nowIndex = nextPk.slice(-1)[0];

    // 05-2-2 特殊判断
    // 05-2-2-1 循环体
    if (fatherCard.$$typeof === 2) {
      // 05-2-2-1-1 假如已经到底，则回去重新执行循环头
      if (nowIndex === 1) {
        // 改指针到头部
        pointOfCard = nextPk;
        return callback(checkedGraphBlockId, cardsRun_0_2_ver);
      }
    }
    // 05-2-2-2 判断体
    if (fatherCard.$$typeof === 4) {
      // 05-2-2-2-1 假如已经到 if 或者 else 的底部
      if (nowIndex === 1 || nowIndex === 2) {
        // 跳出判断体
        pointOfCard = [...nextPk.slice(0, -2), nextPk.slice(-2, -1)[0] + 1];
        // withoutNext 指针已经跳转到下一个了，不需要开始的时候再重新获取指针
        return callback(checkedGraphBlockId, cardsRun_0_2_ver, true);
      }
    }

    if (fatherCard.$$typeof === 7) {
      // 05-2-2-2-1 假如已经到 try 底部 Catch 底部
      if (nowIndex === 1 || nowIndex === 2) {
        // 跳入finally
        pointOfCard = [...nextPk.slice(0, -1), 2, 0];
        // withoutNext 指针已经跳转到下一个了，不需要开始的时候再重新获取指针
        return callback(checkedGraphBlockId, cardsRun_0_2_ver, true);
      } else if (nowIndex === 3) {
        // 跳出tryCatch体
        pointOfCard = [...nextPk.slice(0, -2), nextPk.slice(-2, -1)[0] + 1];
        // withoutNext 指针已经跳转到下一个了，不需要开始的时候再重新获取指针
        return callback(checkedGraphBlockId, cardsRun_0_2_ver, true);
      }
    }

    await cardsRun_0_2_doubleFloor_pointRun(cards, nextPk);
  }
};

const putIntoHisFather = (pre, currentNodeTemp, parentId, callback) => {
  // return pre.map(item=>{
  //   if(item.id === )
  // })
};

export const getMxgraphTempCenter = () => {
  return mxgraphTempCenter;
};

export const sortEditorTree = () => {
  console.log(`mxgraphTempCenter`, mxgraphTempCenter);
  mxgraphTempCenter = convertEditorTree(mxgraphTempCenter);
  console.log(`mxgraphTempCenter 整理后`, mxgraphTempCenter);
  return mxgraphTempCenter;
};

const convertEditorTree = data => {
  let temp = [...data];
  let obj = {};
  let result = [];
  let nowBlock;
  let nowPoint;

  temp.forEach((block, index) => {
    obj = {};
    console.log(`result`, result, block);

    // 开始指针指向最底层
    if (index === 0) {
      nowPoint = result;
    }

    if (block.sp) {
      // 移动指针切换层操作
      switch (block.sp) {
        // for循环体
        case 'startGroup':
          // 放入循环判定代码
          nowBlock.tempLine = block.line;
          // 指针指向循环体内部
          nowPoint = nowBlock.children; // 指针切到当前的children
          break;
        case 'endGroup':
          nowPoint = nowBlock.lastPoint; // 指针切出上层
          break;
        // if判断
        case 'if':
          // 放入判断判定代码
          nowBlock.tempLine = block.line;
          // 指针指向if
          nowPoint = nowBlock.ifChildren; // 指针切到当前的children
          break;
        case 'lineTrue':
          break;
        case 'lineFalse':
          // 指针指向else
          nowPoint = nowBlock.elseChildren; // 指针切到当前的children
          break;
        case 'endif':
          // 指针指向else
          nowPoint = nowBlock.lastPoint; // 指针切出上层
          nowBlock = nowBlock.lastBlock;
          break;
        // tryCatch结束
        case 'tryEnd':
          nowPoint = nowBlock.lastPoint; // 指针切出上层(再飞一层)
          nowBlock = nowBlock.lastBlock;
          break;
      }
    } else {
      switch (block.currentNode.shape) {
        case 'group':
          // 加入子元素
          obj = {
            ...block,
            hasChildren: ['children'],
            children: [],
            $$typeof: 2,
            tempLine: '',
            lastBlock: nowBlock,
            lastPoint: nowPoint, //记录上一层指针位置
          };
          nowPoint.push(obj);
          nowBlock = nowPoint[nowPoint.length - 1]; // 指针位置[]刚新增的这个块体
          break;
        case 'processblock':
          obj = { ...block, $$typeof: 0, lastPoint: nowPoint };
          nowPoint.push(obj);
          break;
        case 'rhombus-node':
          // 加入子元素
          obj = {
            ...block,
            hasChildren: ['ifChildren', 'elseChildren'],
            ifChildren: [],
            elseChildren: [],
            $$typeof: 4,
            tempLine: '',
            lastBlock: nowBlock,
            lastPoint: nowPoint, //记录上一层指针位置
          };
          nowPoint.push(obj);
          nowBlock = nowPoint[nowPoint.length - 1]; // 指针位置[]刚新增的这个块体
          break;
        case 'try':
          // 加入子元素
          obj = {
            ...block,
            hasChildren: ['tryChildren', 'catchChildren', 'finallyChildren'],
            tryChildren: [],
            catchChildren: [],
            finallyChildren: [],
            $$typeof: 7,
            lastBlock: nowBlock, // 要给tryEnd跳出的机会
            lastPoint: nowPoint, //记录上一层指针位置
          };
          nowPoint.push(obj);
          nowBlock = nowPoint[nowPoint.length - 1]; // 指针位置[]刚新增的这个块体
          nowPoint = nowBlock.tryChildren;
          break;
        case 'catch':
          nowPoint = nowBlock.catchChildren; // 指针切出上层
          break;
        case 'finally':
          nowPoint = nowBlock.finallyChildren; // 指针切出上层
          break;
      }
    }
  });

  return result;
};

let find = undefined;
let existCircleCounter = [];
export const clearCircleCounter = () => {
  existCircleCounter = [];
};

/**
 *
 * @param {*} graphData ggeditor下的包含结点和边的集合的对象
 * @param {*} graphDataMap 存储每个结点附加信息的对象
 * @param {*} currentId  当前待解析的结点ID
 * @param {*} result 最终翻译出来的python代码
 * @param {*} depth 当前解析的深度，主要是实现转译过程中的缩进效果.
 * @param {*} breakPoint 解析到此处时停止解析的过程
 * @param {*} notWhile 手动标记当前的判断结点为非循环的类型
 */
export const transformEditorProcess = (
  graphData,
  graphDataMap,
  currentId,
  result,
  depth = 1,
  breakPoint,
  notWhile = false
) => {
  // 根据id获取当前待解析的流程结点
  const currentNode = findNodeById(graphData.nodes, currentId);
  // 在breakPoint处停止解析
  if (currentId === breakPoint) return;

  console.log(`当前的`, currentId, existCircleCounter);
  // 假如存在回环

  if (existCircleCounter.includes(currentId)) {
    if (
      currentNode.shape === 'rhombus-node' ||
      currentNode.shape === 'try' ||
      currentNode.shape === 'group'
    ) {
    } else {
      throw '流程图顺序连线不能产生回环，循环请拖入“循环”进行设计';
    }
  }
  existCircleCounter.push(currentId);

  console.log(`转译`, currentNode.shape, currentId);

  // 加入节点信息
  mxgraphTempCenter.push({
    depth,
    currentNode,
    currentId,
    //nodes: graphData.nodes,
  });

  // 获取结点保存的数据信息
  const blockData = graphDataMap.get(currentId) || {};
  switch (currentNode.shape) {
    case 'processblock':
      // 获取流程块的输入参数列表
      const params = blockData['properties'][1].value;
      // 获取流程块声明的全局变量
      const variable = blockData.variable || [];
      // 在文件顶部添加该流程的函数模块, 并调用该函数。
      const funcName = `RPA_${currentId}`; //uniqueId('RPA_');

      result.output =
        `def ${funcName}(${params
          .filter(item => item.name)
          .map(item => item.name)
          .join(',')}):\n${
          // 调用转译流程块结点的函数
          transformBlockToCode(blockData.cards || [], 1, blockData).output ||
            '\n'
        }` + result.output;
      // 判断一下当前的流程块结点是否有两个入点，那么就是循环相关 就需要包括在 while True: 的循环结构下边。
      // 同时解析的深度要 +1
      if (
        !notWhile &&
        hasTwoEntryPortInProcessBlock(graphData.edges, currentId)
      ) {
        // result.output += `${padding(depth)}while True:\n`;
        // depth = depth + 1;
        // result.output += 'pass\n'
      }

      // 如果跟循环没有关系的话就直接执行当前的代码块
      // 获取当前模块返回的参数列表
      const return_string = blockData['properties'][2].value
        .map(item => item.name)
        .join(',');
      // 拼接当前流程块的函数
      result.output += `${padding(depth)}${
        return_string ? return_string + ' = ' : ''
      }${funcName}(${params
        .filter(item => item.name)
        .map(item => item.name + ' = ' + item.value)
        .join(',')})\n`;

      /**
       * 实验田
       *
       *
       */
      const findLabelName = graphData.nodes.find(item => item.id === currentId)
        .label;

      // 改造card结构为有循环体头的结构
      // 1 移除掉ignore注释的部分
      const clearIgnoreCard = (cards, callback) => {
        if (!cards) return [];
        const types = [
          'children',
          'ifChildren',
          'elseChildren',
          'tryChildren',
          'catchChildren',
          'finallyChildren',
        ];
        return cards.reduce(
          (pre, item) => {
            // 忽略的不加入cards
            if (item && item.ignore !== true) {
              // 有儿子的拆分打平卡片
              types.forEach(type => {
                if (item[type]) {
                  // 追加索引池
                  if (!item.hasChildren) {
                    item.hasChildren = [type];
                  } else {
                    item.hasChildren.push(type);
                  }

                  item[type] = callback(item[type], clearIgnoreCard);
                }
              });

              return [...pre, item];
            } else {
              return pre;
            }
          },
          []
          // return [];
        );
      };

      // console.log(`[重点]`, blockData.cards || []);
      // console.log(
      //   `[重点]`,
      //   clearIgnoreCard(cloneDeep(blockData.cards), clearIgnoreCard) || []
      // );

      // // 清理注释后的blockData
      // const afterClearBlockData =
      //   clearIgnoreCard(cloneDeep(blockData.cards), clearIgnoreCard) || [];

      tempCenter.push({
        currentId: currentId,
        pythonCode: `def ${funcName}(${params
          .filter(item => item.name)
          .map(item => item.name)
          .join(',')}):\n${
          // 调用转译流程块结点的函数
          transformBlockToCode(blockData.cards || [], 1, blockData).output ||
            '\n'
        }`,
        funcName: funcName,
        params: params,
        return_string: return_string ? return_string : '',
        //`${padding(depth)}
        __main__: `${
          return_string ? return_string + ' = ' : ''
        }${funcName}(${params
          .filter(item => item.name)
          .map(item => item.name + ' = ' + item.value)
          .join(',')})\n`,
        cards:
          clearIgnoreCard(cloneDeep(blockData.cards), clearIgnoreCard) || [],
        titleName: findLabelName ? findLabelName : '未定义流程块名',
        blockData: blockData,
        // },
      });

      console.log(`tempCenter`, tempCenter);

      /**
       * 实验田
       *
       *
       */

      // 寻找下一个要解析的结点
      const next = findTargetIdBySourceId(graphData.edges, currentId);
      // 解析下一个结点，这里要把breakPoint结点透传
      next &&
        transformEditorProcess(
          graphData,
          graphDataMap,
          next,
          result,
          depth,
          breakPoint,
          false
        );
      break;
    case 'rhombus-node':
      /**
       * 情况一: 条件判断的分支具有相同的终点, 不属于循环的情况
       *    需要找到共同的终点，并在那个终点跳出对条件分支的解析，回归主分支
       *
       * 情况二: 条件判断其中有一个的分支在遍历的路径上又回到了自身, 属于循环的情况
       *    额外处理
       */
      const { value, valueList = [], tag = 2 } = blockData['properties'][1];
      let condition = '';
      if (tag === 2) {
        condition = value;
      } else {
        valueList.forEach((item, index) => {
          if (index === valueList.length - 1) {
            // 最后一个，不把连接符填上
            if (item.rule === 'is None' || item.rule === 'is not None') {
              condition += `(${item.v1} ${item.rule}) `;
            } else {
              condition += `(${item.v1} ${item.rule} ${item.v2}) `;
            }
          } else {
            if (item.rule === 'is None' || item.rule === 'is not None') {
              condition += `(${item.v1} ${item.rule}) ${item.connect} `;
            } else {
              condition += `(${item.v1} ${item.rule} ${item.v2}) ${item.connect} `;
            }
          }
        });
      }

      const isYesCircleExist = isCircleExist(
        graphData.edges,
        findNodeByLabelAndId(graphData.edges, currentId, '是'),
        currentId
      );

      const isNoCircleExist = isCircleExist(
        graphData.edges,
        findNodeByLabelAndId(graphData.edges, currentId, '否'),
        currentId
      );

      // 特殊标记
      mxgraphTempCenter.push({
        sp: 'if',
        line: condition,
        parent: currentId,

        depth,
        currentNode,
        currentId,
        // nodes: graphData.nodes,
      });

      const isCircle = isYesCircleExist || isNoCircleExist;

      if (
        !isCircle ||
        findCommonTarget(
          graphData.edges,
          findNodeByLabelAndId(graphData.edges, currentId, '否'),
          findNodeByLabelAndId(graphData.edges, currentId, '是')
        )
      ) {
        // 当找到两者共同的点时结束条件判断的转译
        // 找到两者共同的结束点
        const breakPoint = findCommonTarget(
          graphData.edges,
          findNodeByLabelAndId(graphData.edges, currentId, '否'),
          findNodeByLabelAndId(graphData.edges, currentId, '是')
        );
        // 寻找label为是的出点进行解析
        const nextTrue = findNodeByLabelAndId(graphData.edges, currentId, '是');
        nextTrue && (result.output += `${padding(depth)}if ${condition}:\n`);
        // 特殊标记

        mxgraphTempCenter.push({
          sp: 'lineTrue',
          parent: currentId,

          depth,
          currentNode,
          currentId,
          // nodes: graphData.nodes,
        });
        nextTrue &&
          transformEditorProcess(
            graphData,
            graphDataMap,
            nextTrue,
            result,
            depth + 1,
            breakPoint,
            false
          );
        nextTrue && (result.output += `${padding(depth + 1)}pass\n`);
        // 寻找label为否的出点进行解析
        const nextFalse = findNodeByLabelAndId(
          graphData.edges,
          currentId,
          '否'
        );
        // 特殊标记
        mxgraphTempCenter.push({
          sp: 'lineFalse',
          parent: currentId,

          depth,
          currentNode,
          currentId,
          // nodes: graphData.nodes,
        });
        nextFalse && (result.output += `${padding(depth)}else:\n`);
        nextFalse &&
          transformEditorProcess(
            graphData,
            graphDataMap,
            nextFalse,
            result,
            depth + 1,
            breakPoint,
            false
          );
        nextFalse && (result.output += `${padding(depth + 1)}pass\n`);
        // 从breakPoint处继续解析 此时要设置新的断点为 null

        // 特殊标记
        mxgraphTempCenter.push({
          sp: 'endif',
          parent: currentId,

          depth,
          currentNode,
          currentId,
          // nodes: graphData.nodes,
        });

        breakPoint &&
          transformEditorProcess(
            graphData,
            graphDataMap,
            breakPoint,
            result,
            depth,
            null,
            true
          );
      } else {
        throw '流程图顺序连线不能产生回环，循环请拖入“循环”进行设计';
      }
      //  else if (hasTwoEntryPoint(graphData.edges, currentId)) {
      //   result.output += `${padding(depth)}while ( True ):\n`;
      //   result.output += `${padding(depth + 1)}if${
      //     isYesCircleExist ? ' not' : ''
      //   } ${condition}:\n${padding(depth + 2)}break\n`;
      //   let nextLabel = isYesCircleExist ? '是' : '否';
      //   const nextNode = findNodeByLabelAndId(
      //     graphData.edges,
      //     currentId,
      //     nextLabel
      //   );
      //   nextNode &&
      //     transformEditorProcess(
      //       graphData,
      //       graphDataMap,
      //       nextNode,
      //       result,
      //       depth + 1,
      //       currentId,
      //       false
      //     );

      //   let breakLabel = isYesCircleExist ? '否' : '是';
      //   const breakNode = findNodeByLabelAndId(
      //     graphData.edges,
      //     currentId,
      //     breakLabel
      //   );
      //   breakNode &&
      //     transformEditorProcess(
      //       graphData,
      //       graphDataMap,
      //       breakNode,
      //       result,
      //       depth,
      //       null,
      //       false
      //     );
      // }
      // else {
      //   // 处理存在循环的情况
      //   result.output += `${padding(depth)}if${
      //     isYesCircleExist ? ' not' : ''
      //   } ${condition}:\n${padding(depth + 1)}break\n`;
      //   let nextLabel = isYesCircleExist ? '否' : '是';
      //   const nextNode = findNodeByLabelAndId(
      //     graphData.edges,
      //     currentId,
      //     nextLabel
      //   );
      //   nextNode &&
      //     transformEditorProcess(
      //       graphData,
      //       graphDataMap,
      //       nextNode,
      //       result,
      //       depth - 1,
      //       null,
      //       false
      //     );
      // }

      break;
    case 'try':
      const tryStartNodeEdge = findStartProcessBlockInContain(
        graphData.nodes,
        graphData.edges,
        currentId,
        'try'
      );
      const catchAndFinally = findCatchFinallyNode(
        graphData.nodes,
        graphData.edges,
        currentId
      );
      console.log(catchAndFinally);
      console.log('tryStartNodeEdge', tryStartNodeEdge);
      result.output += `${padding(depth)}try:\n`;
      if (tryStartNodeEdge) {
        if (tryStartNodeEdge.constructor === String) {
          transformEditorProcess(
            graphData,
            graphDataMap,
            tryStartNodeEdge,
            result,
            depth + 1,
            breakPoint,
            false
          );
        } else {
          transformEditorProcess(
            graphData,
            graphDataMap,
            tryStartNodeEdge.id,
            result,
            depth + 1,
            breakPoint,
            false
          );
          console.log('对象');
        }
      }
      result.output += `${padding(depth + 1)}pass\n`;
      if (catchAndFinally.length !== 0) {
        const catchNode = catchAndFinally.find(item => item.shape === 'catch');
        const finallyNode = catchAndFinally.find(
          item => item.shape === 'finally'
        );
        catchNode &&
          transformEditorProcess(
            graphData,
            graphDataMap,
            catchNode.id,
            result,
            depth,
            breakPoint,
            false
          );
        finallyNode &&
          transformEditorProcess(
            graphData,
            graphDataMap,
            finallyNode.id,
            result,
            depth,
            breakPoint,
            false
          );
      }
      const nextPoint = findTargetIdBySourceId(graphData.edges, currentId);
      nextPoint &&
        transformEditorProcess(
          graphData,
          graphDataMap,
          nextPoint,
          result,
          depth,
          breakPoint,
          false
        );
      break;
    case 'catch':
      const catchStartNodeEdge = findStartProcessBlockInContain(
        graphData.nodes,
        graphData.edges,
        currentId,
        'catch'
      );
      console.log('catchStartNodeEdge', catchStartNodeEdge);
      result.output += `${padding(depth)}except Exception as error:\n`;
      if (catchStartNodeEdge) {
        if (catchStartNodeEdge.constructor === String) {
          transformEditorProcess(
            graphData,
            graphDataMap,
            catchStartNodeEdge,
            result,
            depth + 1,
            breakPoint,
            false
          );
        } else {
          transformEditorProcess(
            graphData,
            graphDataMap,
            catchStartNodeEdge.id,
            result,
            depth + 1,
            breakPoint,
            false
          );
          console.log('对象');
        }
      }
      result.output += `${padding(depth + 1)}pass\n`;
      break;
    case 'finally':
      const finallyStartNodeEdge = findStartProcessBlockInContain(
        graphData.nodes,
        graphData.edges,
        currentId,
        'finally'
      );
      console.log('finallyStartNodeEdge', finallyStartNodeEdge);
      result.output += `${padding(depth)}finally:\n`;
      if (finallyStartNodeEdge) {
        if (finallyStartNodeEdge.constructor === String) {
          transformEditorProcess(
            graphData,
            graphDataMap,
            finallyStartNodeEdge,
            result,
            depth + 1,
            breakPoint,
            false
          );
        } else {
          transformEditorProcess(
            graphData,
            graphDataMap,
            finallyStartNodeEdge.id,
            result,
            depth + 1,
            breakPoint,
            false
          );
        }
      }
      result.output += `${padding(depth + 1)}pass\n`;
      // 特殊标记
      mxgraphTempCenter.push({
        sp: 'tryEnd',
        parent: currentId,

        depth,
        currentNode,
        currentId,
        // nodes: graphData.nodes,
      });
      break;
    case 'group':
      const groupStartNodeEdge = findStartProcessBlockInContain(
        graphData.nodes,
        graphData.edges,
        currentId,
        ''
      );
      const groupTrans = translateGroup(blockData);
      result.output += `${padding(depth)}${groupTrans}:\n`;

      mxgraphTempCenter.push({
        sp: 'startGroup',
        line: groupTrans,
        parent: currentId,

        depth,
        currentNode,
        currentId,
        // nodes: graphData.nodes,
      });

      if (groupStartNodeEdge) {
        if (groupStartNodeEdge.constructor === String) {
          transformEditorProcess(
            graphData,
            graphDataMap,
            groupStartNodeEdge,
            result,
            depth + 1,
            breakPoint,
            false
          );
        } else {
          transformEditorProcess(
            graphData,
            graphDataMap,
            groupStartNodeEdge.id,
            result,
            depth + 1,
            breakPoint,
            false
          );
        }
      }

      // 特殊标记
      mxgraphTempCenter.push({
        sp: 'endGroup',
        parent: currentId,

        depth,
        currentNode,
        currentId,
        // nodes: graphData.nodes,
      });

      result.output += `${padding(depth + 1)}pass\n`;
      const nextPoint2 = findTargetIdBySourceId(graphData.edges, currentId);
      nextPoint2 &&
        transformEditorProcess(
          graphData,
          graphDataMap,
          nextPoint2,
          result,
          depth,
          breakPoint,
          false
        );
      // 特殊标记

      break;
    case 'break-node':
      result.output += `${padding(depth)}break\n`;
      const breakNext = findTargetIdBySourceId(graphData.edges, currentId);
      breakNext &&
        transformEditorProcess(
          graphData,
          graphDataMap,
          breakNext,
          result,
          depth,
          breakPoint,
          false
        );
      break;
    case 'continue-node':
      result.output += `${padding(depth)}continue\n`;
      const continueNext = findTargetIdBySourceId(graphData.edges, currentId);
      continueNext &&
        transformEditorProcess(
          graphData,
          graphDataMap,
          continueNext,
          result,
          depth,
          breakPoint,
          false
        );
      break;
    case 'end-node':
      // 停止解析
      break;
    default:
    // do nothing
  }
};

export default (graphData, graphDataMap, clickId, fromOrTo) => {
  const result = {
    output: '',
  };
  const beginId = findStartNode(graphData.nodes || []);

  if (beginId) {
    result.output += "if __name__ == '__main__':\n";
    if (fromOrTo === 'from') {
      const copyGraphData = cloneDeep(graphData);
      const copyEdges = copyGraphData.edges;
      const newArr = copyEdges.filter(item => {
        if (item.source === beginId) {
          // 如果点的是开始节点的下一个节点不做处理
          return item;
        } else {
          // 判断线的目标是否是目标节点，过滤掉
          if (item.target !== clickId) {
            return item;
          }
        }
      });
      const startNode = copyEdges.find(item => item.source === beginId);
      startNode.target = clickId;
      copyGraphData.edges = newArr;
      transformEditorProcess(
        copyGraphData,
        graphDataMap,
        findTargetIdBySourceId(copyGraphData.edges, beginId),
        result,
        1,
        null
      );
    } else if (fromOrTo === 'to') {
      const copyGraphData = cloneDeep(graphData);
      const copyEdges = copyGraphData.edges;
      const newArr = copyEdges.filter(item => {
        return item.source !== clickId;
      });
      copyGraphData.edges = newArr;
      transformEditorProcess(
        copyGraphData,
        graphDataMap,
        findTargetIdBySourceId(copyGraphData.edges, beginId),
        result,
        1,
        null
      );
    } else {
      transformEditorProcess(
        graphData,
        graphDataMap,
        findTargetIdBySourceId(graphData.edges, beginId),
        result,
        1,
        null
      );
    }

    result.output = '# -*- coding: UTF-8 -*-\n' + result.output;
    updateEditorBlockPythonCode(result.output);
    // 暂存到本地 project/python/temp.py
    writeFileRecursive(
      `${process.cwd()}/python/temp.py`,
      result.output,
      function() {
        // console.log('保存成功');
      }
    );
  }

  return result.output;
};
