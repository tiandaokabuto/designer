// import PATH_CONFIG from '@/constants/localFilePath';

const FILE_PATH = {
  current: `${process.cwd()}/`,
  project: `${process.cwd()}/project/`,
  windowHook: `${process.cwd()}/../Python/python3_lib/python.exe ${process.cwd()}/../Python/python3_lib/Lib/site-packages/sendiRPA/PYDHandle.py testHook`,
  WinRun: `${process.cwd()}/../Python/python3_lib/python.exe ${process.cwd()}/../Python/python3_lib/Lib/site-packages/sendiRPA/PYDHandle.py WinRun`,
  getBrowserXpath: `${process.cwd()}/../Python/python3_lib/python.exe ${process.cwd()}/../Python/python3_lib/Lib/site-packages/sendiRPA/ie_xpath_capture.py`,
  pythonExecute: `${process.cwd()}/../Python/python3_lib/python.exe ${process.cwd()}/python/temp.py`,
  CaptureAreaScreen: `${process.cwd()}/../Python/python3_lib/python.exe ${process.cwd()}/../Python/python3_lib/Lib/site-packages/sendiRPA/PYDHandle.py CaptureAreaScreen`,
  EnumWinHandle: `${process.cwd()}/../Python/python3_lib/python.exe ${process.cwd()}/../Python/python3_lib/Lib/site-packages/sendiRPA/PYDHandle.py EnumWinHandle`,
  // pythonExecute: `python3 ${process.cwd()}/python/temp.py`,
};

export default (prefix, pendingPath) => {
  return FILE_PATH[prefix] + (pendingPath || '');
};
