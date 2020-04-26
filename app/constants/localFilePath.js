// import PATH_CONFIG from '@/constants/localFilePath';

const FILE_PATH = {
  project: `${process.cwd()}/project/`,
  windowHook: `${process.cwd()}/../Python/python3_lib/python.exe ${process.cwd()}/../Python/python3_lib/Lib/site-packages/sendiRPA/testHook.py`,
  // pythonExecute: `${process.cwd()}/../Python/python3_lib/python.exe ${process.cwd()}/python/temp.py`,
  pythonExecute: `python3 ${process.cwd()}/python/temp.py`,
};

export default (prefix, pendingPath) => {
  return FILE_PATH[prefix] + (pendingPath || '');
};
