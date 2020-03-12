export const config = {
  context: 'http://172.168.201.90:19090/controller',
};

const apiList = {
  issueProcess: '/designer/issueProcess',
  /** 设计器登录接口 */
  signIn: '/designerLogin/signIn',
  signOut: '/designerLogin/signOut',
  /** 原子能力树型结构获取功能 */
  selectCodeJson: '/designer/selectCodeJson',
  selectMenuJson: '/designer/selectMenuJson',
};

export default description => {
  return config.context + apiList[description];
};
