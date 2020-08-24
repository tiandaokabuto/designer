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
// 第一层按序调试
export const DEBUG_RUN_BLOCK_ALL_RUN = 'debug_run_block_all_run';

// 第二层按序调试
export const DEBUG_RUN_CARDS_ALL_RUN = 'debug_run_cards_all_run';

// PYTHOH_DEBUG_BLOCK_ALL_RUN
