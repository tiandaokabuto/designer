export const config = {
  context: 'http://172.168.201.90:9999',
};

const apiList = {
  issueProcess: '/controller/designer/issueProcess',
  /** 设计器登录接口 */
  signIn: '/controller/designerLogin/signIn',
  signOut: '/controller/designerLogin/signOut',
  /** 原子能力树型结构获取功能 */
  selectCodeJson: '/controller/designer/selectCodeJson',
  selectMenuJson: '/controller/designer/selectMenuJson',
  /** 刷新token */
  refreshToken: '/auth/token/refresh',
};

export default description => {
  return config.context + apiList[description];
};
