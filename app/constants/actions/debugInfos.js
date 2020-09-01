// 修改DEBUG涉及的相关信息
export const CHANGE_DEBUG_INFOS = 'change_debug_infos';

/**
 * 以下部分主要为emiter使用的常量，用来通讯到顶部菜单栏
 * 因为DEBUG需要全局驻留
 * 所以DEBUG的相关实现，放在程序最上方的菜单栏
 *
 * ps: 虽然DEBUG按钮在下方OutputPanel，但不是在那里实现的哦
 */

// 恢复default配置
export const DEBUG_RESET_ALL_INFO = 'debug_reset_all_info';

// 打开DEBUG服务器
export const DEBUG_OPEN_DEBUGSERVER = 'debug_open_debugServer';
// 关闭DEBUG服务器
export const DEBUG_CLOSE_DEBUGSERVER = 'debug_close_debugServer';

// 按序调试
export const DEBUG_RUN_STEP_BY_STEP = 'debug_run_step_by_step';

// 暂停、设置断点
export const DEBUG_SET_PAUSE = 'debug_set_pause';
export const DEBUG_CONTINUE = 'debug_continue';
// 单步继续
export const DEBUG_CONTINUE_ONESTEP_NEXT = 'debug_continue_oneStep_next'

// 重置代码
export const DEBUG_RESET_CODE = 'debug_reset_code';

// 单步调试
export const DEBUG_ONE_STEP = 'debug_one_step';

// 第一层按序调试
export const DEBUG_RUN_BLOCK_ALL_RUN = 'debug_run_block_all_run';
export const DEBUG_RUN_BLOCK_CHANGE_STATE_RUNNING =
  'debug_run_block_change_state_runnning'; // 改变状态为块级running
export const DEBUG_RUN_BLOCK_CHANGE_STATE_PAUSED =
  'debug_run_block_change_state_paused'; // 改变状态为块被暂停中
export const DEBUG_RUN_BLOCK_CHANGE_STATE_END =
  'debug_run_block_change_state_end'; // 改变状态为已跑完

// 第二层按序调试
export const DEBUG_RUN_CARDS_ALL_RUN = 'debug_run_cards_all_run';
export const DEBUG_RUN_CARDS_CHANGE_STATE_RUNNING =
  'debug_run_cards_change_state_runnning'; // 改编状态为块级running
export const DEBUG_RUN_CARDS_CHANGE_STATE_PAUSED =
  'debug_run_cards_change_state_paused'; // 改编状态为块级running
export const DEBUG_RUN_CARDS_CHANGE_STATE_END =
  'debug_run_cards_change_state_end'; // 改编状态为块级running

// 更新按钮继续暂停状态
export const DEBUG_SET_BTN_CAN_BE_PASUE = 'debug_setBtn_canBePause'; // 运行中，显示暂停键
export const DEBUG_SET_BTN_CAN_BE_CONTINUE = 'debug_setBtn_canBeContinue'; // 暂停中，显示继续键

// 单步调试
export const DEBUG_ONE_STEP_RUN_BLOCK = 'debug_oneStep_block';
export const DEBUG_ONE_STEP_RUN_CARDS = 'debug_oneStep_cards';
export const DEBUG_ONE_STEP_RUN_STARTED = 'debug_oneStep_started';
export const DEBUG_ONE_STEP_FINISHED = 'debug_oneStep_finished'; // 通知完成
export const DEBUG_ONE_STEP_FINISHED_BLOCK = 'debug_oneStep_finished_block';
export const DEBUG_ONE_STEP_FINISHED_CARDS = 'debug_oneStep_finished_cards';
export const DEBUG_ONE_STEP_FINISHED_STARTED = 'debug_oneStep_finished_started';


// 数据仓储
export const DEBUG_PUT_SOURCECODE = "debug_put_sourceCode"
export const DEBUG_SOURCECODE_INSERT = "debug_sourceCode_insert"


// 执行到此处，从此处执行
export const DEBUG_START_TO_HERE = "debug_start_to_here";
export const DEBUG_HERE_TO_END = "debug_here_to_end"
