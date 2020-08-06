// import PATH_CONFIG from '@/constants/localFilePath';

const FILE_PATH = {
  current: `${process.cwd()}/`,
  project: `${process.cwd()}/project/`,
  windowHook: `${process.cwd()}/../Python/python3_lib/python.exe ${process.cwd()}/../Python/python3_lib/Lib/site-packages/sendiRPA/testHook.py`,
  WinRun: `${process.cwd()}/../Python/python3_lib/python.exe ${process.cwd()}/../Python/python3_lib/Lib/site-packages/sendiRPA/WinRun.py`,
  getBrowserXpath: `${process.cwd()}/../Python/python3_lib/python.exe ${process.cwd()}/../Python/python3_lib/Lib/site-packages/sendiRPA/ie_xpath_capture.py`,
  pythonExecute: `${process.cwd()}/../Python/python3_lib/python.exe ${process.cwd()}/python/temp.py`,
  CaptureAreaScreen: `${process.cwd()}/../Python/python3_lib/python.exe ${process.cwd()}/../Python/python3_lib/Lib/site-packages/sendiRPA/CaptureAreaScreen.py`,
  // pythonExecute: `python3 ${process.cwd()}/python/temp.py`,
};

export default (prefix, pendingPath) => {
  return FILE_PATH[prefix] + (pendingPath || '');
};
