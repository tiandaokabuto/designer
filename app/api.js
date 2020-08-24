export const config = {
  context: 'https://172.168.201.90:44388',
};

const apiList = {
  /** 发布流程接口 */
  issueProcess: '/controller/designer/issueProcess',
  getProcessVersion: '/controller/designer/getProcessVersion',
  /** 设计器登录接口 */
  signIn: '/controller/designerLogin/signIn',
  signOut: '/controller/designerLogin/signOut',
  /** 原子能力树型结构获取功能 */
  selectCodeJson: '/controller/designer/selectCodeJson',
  selectMenuJson: '/controller/designer/selectMenuJson',
  /** 刷新token */
  refreshToken: '/auth/token/refresh',
  /** 获取控制台设置的参数 */
  variableNames: '/controller/designer/getVariableNameAndId',
  /** 任务数据的组件属性使用-根据任务数据名称-查询任务数据的字段结构 */
  taskDataFields: '/controller/designer/getTaskDataFields',
  /** 任务数据的组件属性使用-查询任务数据名称 */
  taskDataNames: '/controller/designer/getTaskDataNames',
};

export default description => {
  return config.context + apiList[description];
};
