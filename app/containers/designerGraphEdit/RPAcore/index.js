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
  //
  DEBUG_PUT_SOURCECODE,
} from '../../../constants/actions/debugInfos';
import { changeDebugInfos } from '../../../containers/reduxActions';

const padding = length => '    '.repeat(length);

let tempCenter = [];
let nowIndex = 0;
let nowIndexCards = 0;
let nowLevel = 'block';
let pass = false;
let isPause = false;

// 清空代码分段缓存区
export const claerTempCenter = () => {
  tempCenter = [];
  nowIndex = 0;
  nowIndexCards = 0;
  pass = false;
  isPause = false;
  nowLevel = 'block';
};

export const getDebugIndex = () => {
  return {
    nowIndex: nowIndex,
    nowIndexCards: nowIndexCards,
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
    nowIndex,
    nowIndexCards,
    pass,
    isPause,
  };
};

export const clearPause = () => {
  isPause = false;
  return {
    tempCenter,
    nowIndex,
    nowIndexCards,
    pass,
    isPause,
  };
};

// 【 editor的单步调试 - 01 】开始第一层块级，逐步发送
export const handleDebugBlockAllRun = () => {
  nowLevel = 'block';
  if (isPause) {
    // 当检测到暂停时
    // 1. 设置按钮为可点继续
    // 2. 修改运行状态为blockAll_pause
    changeDebugInfos(DEBUG_SET_BTN_CAN_BE_CONTINUE, {});
    changeDebugInfos(DEBUG_RUN_BLOCK_CHANGE_STATE_PAUSED, {}); // 'blockAll_pause'
    return message.info('进程被暂停');
  }
  if (tempCenter.length < 1) {
    // 结束时，自动复位
    changeDebugInfos(DEBUG_RUN_BLOCK_CHANGE_STATE_END, {});
    return message.warning('无流程块可以运行');
  }
  if (nowIndex >= tempCenter.length) {
    nowIndex = 0;
    changeDebugInfos(DEBUG_RUN_BLOCK_CHANGE_STATE_END, {});
    return message.success('流程已完成');
  }

  //console.clear();
  console.log('开始自动单步调试！第一层级别');
  console.log(tempCenter);
  const running = tempCenter[nowIndex];
  // const findVarNames = running.properties.required.find(
  //   item => item.cnName === '输出到' || item.cnName === '变量名称'
  // );

  if (pass === true) {
    // 执行
    setTimeout(() => {
      sendPythonCodeByLine({
        running: running,
        varNames: running.return_string,
        // varNames: findVarNames ? findVarNames.value : '',
        output: running.__main__,
      });
      nowIndex += 1;
      message.info(`当前运行${nowIndex} of ${tempCenter.length}`);
    }, 300);
    return (pass = false);
  } else {
    setTimeout(() => {
      sendPythonCodeByLine({
        running: running,
        varNames: "",//running.return_string,
        //varNames: findVarNames ? findVarNames.value : '',
        output: running.pythonCode,
      });
    }, 300);
    return (pass = true);
  }
};

// 【 editor的单步调试 - 02 】开始第二层卡片级，逐步发送
export const handleDebugCardsAllRun = checkedGraphBlockId => {
  nowLevel = 'cards';
  if (isPause) {
    changeDebugInfos(DEBUG_SET_BTN_CAN_BE_CONTINUE, {});
    changeDebugInfos(DEBUG_RUN_CARDS_CHANGE_STATE_PAUSED, {}); // 'cardsAll_pause'
    return message.info('进程被暂停');
  }
  const cardsIndex = tempCenter.findIndex(block => {
    return block.currentId === checkedGraphBlockId;
  });
  if (cardsIndex === -1) {
    changeDebugInfos(DEBUG_RUN_CARDS_CHANGE_STATE_END, {});
    return message.warning('这个流程块没有被正确连线到流程中，请检查连线关系');
  }

  const needRunBlock = tempCenter[cardsIndex].cards;

  if (tempCenter.length < 1) {
    changeDebugInfos(DEBUG_RUN_CARDS_CHANGE_STATE_END, {});
    return message.warning('无代码块可以运行');
  }
  if (nowIndexCards >= needRunBlock.length) {
    nowIndexCards = 0;
    changeDebugInfos(DEBUG_RUN_CARDS_CHANGE_STATE_END, {});
    return message.success('流程块已完成');
  }

  // 断点检查
  if (nowIndexCards === 0) {
    if (needRunBlock[nowIndexCards].breakPoint === true) {
      message.info('流程块第1条遇到断点');
      // localStorage.setItem(
      //   'running_mode',
      //   'blockAll_pause'
      // );
      setPause();
      needRunBlock[nowIndexCards].breakPoint = false;
      changeDebugInfos(DEBUG_SET_BTN_CAN_BE_CONTINUE, {});
      changeDebugInfos(DEBUG_RUN_CARDS_CHANGE_STATE_PAUSED, {}); // 'cardsAll_pause'
      return; // event.emit(PYTHOH_DEBUG_BLOCK_ALL_RUN_PAUSE);
      //needRunBlock[cardsIndex].breakPoint === false;
    }
  }
  if (nowIndexCards + 1 < needRunBlock.length) {
    // 他有下一条存在
    if (needRunBlock[nowIndexCards + 1].breakPoint === true) {
      message.info('发现了1个断点');
      setPause();
    }
  }

  setTimeout(() => {
    //console.clear();
    console.log(needRunBlock);
    clickOneStepRun(needRunBlock, needRunBlock[nowIndexCards].id);
    nowIndexCards += 1;
    message.info(`当前运行${nowIndexCards} of ${needRunBlock.length}`);
  }, 300);
};

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

// 新增辅助标识符
const get_level_Tag = (depth, on=false) => {
  let levelTag = '';
  if(!on){
    return levelTag;
  }
  let arr = new Array(depth-1).keys();
  arr = Array.from(arr);
  //levelTag += arr.length
  if(arr.length === 0){
    return levelTag;
  }
  arr.forEach((item,index) => {
    // if(index === arr.length -1){
    //   levelTag += "┖"
    // }else{
    //   //levelTag += "-"
    // }
    levelTag += "┖"
  });
  return levelTag;
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
        result.output += `${padding(depth)}while True:\n`;
        depth = depth + 1;
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
        cards: cloneDeep(blockData.cards) || [],
        titleName: get_level_Tag(depth,true) + `${findLabelName ? findLabelName : '未定义流程块名'}`,
        blockData: blockData,
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
            if (item.rule === 'is None' || item.rule === 'not None') {
              condition += `(${item.v1} ${item.rule}) `;
            } else {
              condition += `(${item.v1} ${item.rule} ${item.v2}) `;
            }
          } else {
            if (item.rule === 'is None' || item.rule === 'not None') {
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
        nextTrue &&
          (result.output += `${padding(depth)}if ${condition}:\n`) &&
          tempCenter.push({
            currentId: currentId,
            pythonCode: `if${isYesCircleExist ? ' not' : ''} ${condition}:\n`,
            funcName: `_START_IF_`,
            return_string: '',
            cards: cloneDeep(blockData.cards) || [],
            titleName:
              get_level_Tag(depth) +
              `判断是 if${isYesCircleExist ? ' not' : ''} ${condition}:\n`,
            blockData: blockData,
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
        nextFalse &&
          (result.output += `${padding(depth)}else:\n`) &&
          tempCenter.push({
            currentId: currentId,
            pythonCode: `else:\n`,
            funcName: `_ELSE_IF_`,
            return_string: '',
            cards: cloneDeep(blockData.cards) || [],
            titleName: get_level_Tag(depth) + `判断否:\n`,
            blockData: blockData,
          });
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
      } else if (hasTwoEntryPoint(graphData.edges, currentId)) {
        result.output += `${padding(depth)}while ( True ):\n`;
        result.output += `${padding(depth + 1)}if${
          isYesCircleExist ? ' not' : ''
        } ${condition}:\n${padding(depth + 2)}break\n`;
        let nextLabel = isYesCircleExist ? '是' : '否';
        const nextNode = findNodeByLabelAndId(
          graphData.edges,
          currentId,
          nextLabel
        );
        nextNode &&
          transformEditorProcess(
            graphData,
            graphDataMap,
            nextNode,
            result,
            depth + 1,
            currentId,
            false
          );
        let breakLabel = isYesCircleExist ? '否' : '是';
        const breakNode = findNodeByLabelAndId(
          graphData.edges,
          currentId,
          breakLabel
        );
        breakNode &&
          transformEditorProcess(
            graphData,
            graphDataMap,
            breakNode,
            result,
            depth,
            null,
            false
          );
      } else {
        // 处理存在循环的情况
        result.output += `${padding(depth)}if${
          isYesCircleExist ? ' not' : ''
        } ${condition}:\n${padding(depth + 1)}break\n`;
        let nextLabel = isYesCircleExist ? '否' : '是';
        const nextNode = findNodeByLabelAndId(
          graphData.edges,
          currentId,
          nextLabel
        );
        nextNode &&
          transformEditorProcess(
            graphData,
            graphDataMap,
            nextNode,
            result,
            depth - 1,
            null,
            false
          );
      }
      tempCenter.push({
        currentId: currentId,
        pythonCode: `pass\n`,
        funcName: `_END_IF_`,
        //params: params,
        return_string: '',
        //`${padding(depth)}
        // __main__: `${
        //   return_string ? return_string + ' = ' : ''
        // }${funcName}(${params
        //   .filter(item => item.name)
        //   .map(item => item.name + ' = ' + item.value)
        //   .join(',')})\n`,
        cards: cloneDeep(blockData.cards) || [],
        titleName: get_level_Tag(depth) + `判断结束\n`,
        blockData: blockData,
      });
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

      tempCenter.push({
        currentId: currentId,
        pythonCode: `try:\n`,
        funcName: `_START_TRY_`,
        return_string: '',
        cards: cloneDeep(blockData.cards) || [],
        titleName:
          get_level_Tag(depth) +
          `异常捕获\n`,
        blockData: blockData,
      }); // 【sp1 - 记录代码】

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

      tempCenter.push({
        currentId: currentId,
        pythonCode: `pass\n`,
        funcName: `_END_TRY_`,
        return_string: '',
        cards: cloneDeep(blockData.cards) || [],
        titleName:
          get_level_Tag(depth) +
          `异常捕获\n`,
        blockData: blockData,
      }); // 【sp1 - 记录代码】

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

      tempCenter.push({
        currentId: currentId,
        pythonCode: `except Exception as error:\n`,
        funcName: `_START_EXCEPT_`,
        return_string: '',
        cards: cloneDeep(blockData.cards) || [],
        titleName:
          get_level_Tag(depth) +
          `异常处理\n`,
        blockData: blockData,
      }); // 【sp1 - 记录代码】

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

      tempCenter.push({
        currentId: currentId,
        pythonCode: `pass\n`,
        funcName: `_END_EXCEPT_`,
        return_string: '',
        cards: cloneDeep(blockData.cards) || [],
        titleName:
          get_level_Tag(depth) +
          `---- ---- ----\n`,
        blockData: blockData,
      }); // 【sp1 - 记录代码】

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

      tempCenter.push({
        currentId: currentId,
        pythonCode: `finally:\n`,
        funcName: `_START_FINALLY_`,
        return_string: '',
        cards: cloneDeep(blockData.cards) || [],
        titleName:
          get_level_Tag(depth) +
          `异常处理\n`,
        blockData: blockData,
      }); // 【sp1 - 记录代码】


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

      tempCenter.push({
        currentId: currentId,
        pythonCode: `pass\n`,
        funcName: `_END_FINALLY_`,
        return_string: '',
        cards: cloneDeep(blockData.cards) || [],
        titleName:
          get_level_Tag(depth) +
          `---- ---- ----\n`,
        blockData: blockData,
      }); // 【sp1 - 记录代码】

      break;
    case 'group':
      const groupStartNodeEdge = findStartProcessBlockInContain(
        graphData.nodes,
        graphData.edges,
        currentId,
        ''
      );
      const groupTrans = translateGroup(blockData);
      console.log(`加入循环`, groupTrans, tempCenter);

      result.output += `${padding(depth)}${groupTrans}:\n`;

      // tempCenter
      tempCenter.push({
        currentId: currentId,
        pythonCode: `${groupTrans}:\n`,
        funcName: `_START_GROUP_`,
        //params: params,
        return_string: '',
        //`${padding(depth)}
        // __main__: `${
        //   return_string ? return_string + ' = ' : ''
        // }${funcName}(${params
        //   .filter(item => item.name)
        //   .map(item => item.name + ' = ' + item.value)
        //   .join(',')})\n`,
        cards: cloneDeep(blockData.cards) || [],
        titleName: get_level_Tag(depth) + `循环 ${groupTrans}:\n`,
        blockData: blockData,
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

      console.log(`循环结束`, groupTrans, tempCenter);

      tempCenter.push({
        currentId: currentId,
        pythonCode: `${groupTrans}:\n`,
        funcName: `_END_GROUP_`,
        //params: params,
        return_string: '',
        //`${padding(depth)}
        // __main__: `${
        //   return_string ? return_string + ' = ' : ''
        // }${funcName}(${params
        //   .filter(item => item.name)
        //   .map(item => item.name + ' = ' + item.value)
        //   .join(',')})\n`,
        cards: cloneDeep(blockData.cards) || [],
        titleName: get_level_Tag(depth) + `循环结束 ${groupTrans}:\n`,
        blockData: blockData,
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
