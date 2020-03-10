export const config = {
  context: 'http://172.168.201.90:19090/controller',
};

const apiList = {
  issueProcess: '/designer/issueProcess',
  /** 设计器登录接口 */
  signIn: '/designerLogin/signIn',
  signOut: '/designerLogin/signOut',
};

export default description => {
  return config.context + apiList[description];
};
