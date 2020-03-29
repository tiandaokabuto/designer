// import PATH_CONFIG from '@/constants/localFilePath';

const FILE_PATH = {
  project: `${process.cwd()}/project/`,
};

export default (prefix, pendingPath) => {
  return FILE_PATH[prefix] + pendingPath;
};
