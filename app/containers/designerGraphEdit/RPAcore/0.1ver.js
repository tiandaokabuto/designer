// 【 editor的单步调试 - 0.1版 】开始第二层卡片级，逐步发送
export const cardsRun_0_1_ver = checkedGraphBlockId => {
  nowLevel = 'cards';
  if (isPause) {
    changeDebugInfos(DEBUG_SET_BTN_CAN_BE_CONTINUE, {});
    changeDebugInfos(DEBUG_RUN_CARDS_CHANGE_STATE_PAUSED, {}); // 'cardsAll_pause'
    return message.info('进程被暂停');
  }
  // 找到当前使用的流程块
  const findProcess = tempCenter.find(block => {
    return block.currentId === checkedGraphBlockId;
  });
  if (!findProcess) {
    changeDebugInfos(DEBUG_RUN_CARDS_CHANGE_STATE_END, {});
    return message.warning('这个流程块没有被正确连线到流程中，请检查连线关系');
  }

  // 把流程块中的卡片组取出来
  const cards = findProcess.cards;

  // 情况1： 流程块内没有卡片
  if (cards.length < 1) {
    changeDebugInfos(DEBUG_RUN_CARDS_CHANGE_STATE_END, {});
    return message.warning('无代码块可以运行');
  }

  // 情况2： 去到的下一个指针
  let nextPk = getNextIndexCards(cards, pointOfCard);
  let nextCard = getCardsByPk(cards, nextPk);
  let fatherCard = undefined;
  let nowIndex = undefined;

  // 下一个指针是第一层，而且已经没有卡片，
  if (nextPk.length === 1 && !nextCard) {
    pointOfCard = undefined;
    changeDebugInfos(DEBUG_RUN_CARDS_CHANGE_STATE_END, {});
    return message.success('流程块已完成');
  }

  // 假如长度只有1而且有儿子，则直接跳过指针
  if (nextCard.hasChildren) {
    pointOfCard = nextPk;
    nextPk = getNextIndexCards(cards, pointOfCard);
    // nextCard = getCardsByPk(cards, nextPk);
    // pointOfCard = undefined;
    // changeDebugInfos(DEBUG_RUN_CARDS_CHANGE_STATE_END, {});
    // return message.success('流程块已完成');
  }

  // 断点检查
  // if (nowIndexCards === 0) {
  //   if (needRunBlock[nowIndexCards].breakPoint === true) {
  //     message.info('流程块第1条遇到断点');

  //     // localStorage.setItem(
  //     //   'running_mode',
  //     //   'blockAll_pause'
  //     // );
  //     setPause();
  //     needRunBlock[nowIndexCards].breakPoint = false;
  //     changeDebugInfos(DEBUG_SET_BTN_CAN_BE_CONTINUE, {});
  //     changeDebugInfos(DEBUG_RUN_CARDS_CHANGE_STATE_PAUSED, {}); // 'cardsAll_pause'
  //     return; // event.emit(PYTHOH_DEBUG_BLOCK_ALL_RUN_PAUSE);
  //     //needRunBlock[cardsIndex].breakPoint === false;
  //   }
  // }
  // if (nowIndexCards + 1 < needRunBlock.length) {
  //   // 他有下一条存在
  //   if (needRunBlock[nowIndexCards + 1].breakPoint === true) {
  //     message.info('发现了1个断点');
  //     setPause();
  //   }
  // }

  console.log(`代码】`, nextPk, spPointer);

  if (nextPk.length % 2 === 1) {
    // 卡片

    // 执行块之前，先检查这个块能不能执行
    // for 不通过，则跳出循环
    // if 不通过，指针跳到else执行
    // -- if中元素为空
    // -- else中元素为空
    // -- 假如不为空，则正常执行
    // -- 假如为空，重新发送判定
    // tryCatch 不通过，跳到catch执行，通过继续执行try

    // 假如这个子元素，实际上是空数组，则指针上移动，重复下面elseif的操作
    if (!nextCard) {
      pointOfCard = nextPk;
      nextPk = getNextIndexCards(cards, pointOfCard);
      // nextCard = getCardsByPk(cards, nextPk);
      // TODO: 执行else IF的操作
    }

    setTimeout(() => {
      clickOneStepRun(nextCard, -1);
      pointOfCard = nextPk;
      let tempString = [...nextPk]
        .reduce((pre, no) => {
          return pre + (no + 1).toString() + `-`;
        }, '')
        .slice(0, -1);
      message.info(`当前运行${tempString}`);
    }, 300);
  } else if (nextPk.length > 1) {
    // 卡组
    fatherCard = getCardsByPk(cards, nextPk.slice(0, -1)); // 找到这个容器的属性
    nowIndex = nextPk.slice(-1)[0];

    console.log(`\n\n\n\n\n`, fatherCard);
    if (fatherCard.$$typeof === 2) {
      // 循环
      // 发送for判别式

      // 到循环尾部，则直接跳回for循环头部
      if (nowIndex === 1) {
        pointOfCard = nextPk;
        nextPk = getNextIndexCards(cards, pointOfCard);
      }

      setTimeout(() => {
        let forLine = transformLoopStatement(
          '',
          fatherCard,
          { output: '' },
          {}
        );

        if (!spPointer.find(item => item.pk === nextPk.slice(0, -1))) {
          spPointer.push({
            pk: nextPk,
            line: forLine,
            type: 'for',
            check: undefined,
          });
        }

        clickOneStepRun(fatherCard, -1, forLine);
        pointOfCard = nextPk;
        let tempString = [...nextPk]
          .reduce((pre, no) => {
            return pre + (no + 1).toString() + `-`;
          }, '')
          .slice(0, -1);
        message.info(`当前运行${tempString},${forLine}`);
      }, 300);
    } else if (fatherCard.$$typeof === 4) {
      // 判断
      // 发送for判别式
      // 到判断else处，则直接跳出块体
      if (nowIndex === 1 || nowIndex === 2) {
        nextPk = [...nextPk.slice(0, -2), nowIndex + 1];
        // 跳出
      } else {
        setTimeout(() => {
          let ifLine = transformConditionalStatement(
            '',
            fatherCard,
            { output: '' },
            {}
          );

          if (!spPointer.find(item => item.pk === nextPk.slice(0, -1))) {
            spPointer.push({
              pk: nextPk,
              line: ifLine,
              type: 'if',
              check: undefined,
            });
          }

          clickOneStepRun(fatherCard, -1, ifLine);
          pointOfCard = nextPk;
          let tempString = [...nextPk]
            .reduce((pre, no) => {
              return pre + (no + 1).toString() + `-`;
            }, '')
            .slice(0, -1);
          message.info(`当前运行${tempString},${ifLine}`);
        }, 300);
      }
    } else if (fatherCard.$$typeof === 7) {
      // tryCatch
    }
  }};



  // export const handleRunNextStep = () => {
//   if (localStorage.getItem('running_mode') === 'blockAll_running') {
//     // event.emit(PYTHOH_DEBUG_BLOCK_ALL_RUN);
//     //message.info("暂不支持流程图的单步调试")
//     setPause();
//   } else if (localStorage.getItem('running_mode') === 'cardsAll_running') {
//     setPause();
//     //event.emit(PYTHOH_DEBUG_CARDS_ALL_RUN);
//   }

//   // 断点检查
//   if (nowIndexCards === 0) {
//     if (needRunBlock[nowIndexCards].breakPoint === true) {
//       message.info('流程块第1条遇到断点');
//       // localStorage.setItem(
//       //   'running_mode',
//       //   'cardsAll_pause'
//       // );
//       setPause();
//       needRunBlock[nowIndexCards].breakPoint = false;
//       return event.emit(PYTHOH_DEBUG_BLOCK_ALL_RUN_PAUSE);
//       //needRunBlock[cardsIndex].breakPoint === false;
//     }
//   } else if (nowIndexCards + 1 < needRunBlock.length) {
//     // 他有下一条存在
//     if (needRunBlock[nowIndexCards + 1].breakPoint === true) {
//       console.log(needRunBlock);
//       message.info('发现了1个断点');
//       setPause();
//     }
//   }
// };
