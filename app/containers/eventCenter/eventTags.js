export const PYTHON_EXECUTE = /** 执行python代码,将最新的源码提交到redux */ Symbol(
  'python_execute'
);
export const PYTHON_OUTPUT = /** 回显python代码执行后的结果             */ Symbol(
  'python_output'
);

export const PYTHON_OUTPUT_CLEAR = /** 回显python代码执行后的结果             */ Symbol(
  'python_output_clear'
);

export const PYTHON_DISPLAY = /** 将转化后的代码展示到在线编辑器          */ Symbol(
  'python_display'
);

export const CANVAS_ZOOM_OUT = /** 缩小画布                              */ Symbol(
  'canvas_zoom_out'
);

export const CANVAS_ZOOM_IN = /** 放大画布                              */ Symbol(
  'canvas_zoom_in'
);

export const START_POINT = /** 定点执行                                */ Symbol(
  'start_point'
);

export const STOP_RUNNING = /** 暂停                                   */ Symbol(
  'stop_running'
);

export const UNDO = /** 暂停                                   */ Symbol(
  'mxUndoManager_undo'
);

export const REDO = /** 暂停                                   */ Symbol(
  'mxUndoManager_redo'
);

export const PYTHOH_DEBUG_SERVER_START = /** debug服务器启动！ */ Symbol(
  'python_debug_server_start'
);

export const PYTHON_GO_NEXT_STEP = /** 回显python代码执行后的结果             */ Symbol(
  'python_goNextStep'
);

export const PYTHOH_DEBUG_BLOCK_ALL_RUN = /** DEBUG 第一层 整块传送 */ Symbol(
  'python_debug_block_all_run'
);

export const PYTHOH_DEBUG_BLOCK_ALL_RUN_END = /** DEBUG 第一层 完成 */ Symbol(
  'python_debug_block_all_run_end'
);

export const PYTHOH_DEBUG_BLOCK_ALL_RUN_PAUSE = /** DEBUG 第一层 暂停 */ Symbol(
  'python_debug_block_all_run_pause'
);

export const PYTHOH_DEBUG_BLOCK_ALL_RUN_CONTINUE = /** DEBUG 第一层 继续 */ Symbol(
  'python_debug_block_all_run_continue'
);

export const PYTHOH_DEBUG_CARDS_ALL_RUN = /** DEBUG 第二层 所有CARDS传送 */ Symbol(
  'python_debug_cards_all_run_run'
);

export const SHOW_EXPORT_MODAL = /** 展示导出模态框 */ Symbol(
  'show_export_modal'
);
export const REVOKE_ACTION = /** 撤销指令 */ Symbol('revoke_action');
export const RECOVERY_ACTION = /** 恢复指令 */ Symbol('recovery_action');
export const SAVE_FILE = /** CTRL+S 保存文件 */ Symbol('save_file');
export const CUT_COMMAND = /** 剪切指令 */ Symbol('cut_command');
export const COPY_COMMAND = /** 复制指令 */ Symbol('copy_command');
export const COPY_PROCESS_COMMAND = /** 复制流程块指令 */ Symbol(
  'copy_process_command'
);
export const PASTE_COMMAND = /** 粘贴指令 */ Symbol('paste_command');
export const DELETE_COMMAND = /** 删除指令 */ Symbol('delete_command');
export const RELEASE_PROCESS_COMMAND = /** 发布流程 */ Symbol(
  'release_process_command'
);
