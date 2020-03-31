// import PATH_CONFIG from '@/constants/localFilePath';

const FILE_PATH = {
  project: `${process.cwd()}/project/`,
  windowHook: `${process.cwd()}/../Python/python3_lib/python.exe ${process.cwd()}/../Python/python3_lib/Lib/site-packages/sendiRPA/testHook.py`,
<<<<<<< HEAD
  pythonExecute: `${process.cwd()}/../Python/python3_lib/python.exe ${process.cwd()}/python/temp.py`,
};

export default (prefix, pendingPath) => {
  return FILE_PATH[prefix] + pendingPath || '';
=======
  pythonExecute: `${process.cwd()}/../Python/python3_lib/python.exe ${process.cwd()}/python/temp.py`
};

export default (prefix, pendingPath) => {
  return FILE_PATH[prefix] + (pendingPath || '');
>>>>>>> 2119df01458db578e378395d19db23de1f297bcf
};
