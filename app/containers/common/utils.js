//import moment from moment
import { changeProcessTree } from '../reduxActions';
const fs = require('fs');
const process = require('process');

/**
 * 新建项目
 * @param {*} name 项目名称
 * @param {*} callback 项目创建完成后的回调函数
 */
export const newProject = (name, callback) => {
  fs.mkdir(`${process.cwd()}/project/${name}`, { recursive: true }, function(
    err
  ) {
    if (!err) {
      callback();
      console.log('创建成功');
      // 修改左侧自定义目录树
      changeProcessTree([]);
      const initialJson = {
        processTree: [],
      };
      // 创建初始的描述文件
      fs.writeFile(
        `${process.cwd()}/project/${name}/manifest.json`,
        JSON.stringify(initialJson),
        function(err) {
          console.log(err);
        }
      );
    }
  });
};

/**
 * 读取项目文件夹下的所有项目
 * @param {*} path
 */
export const readAllFileName = path => {
  const result = fs.readdirSync(`${process.cwd()}/project/`);
  const fileList = [];
  result.forEach((name, key) => {
    const status = fs.statSync(`${process.cwd()}/project/` + name);
    fileList.push({
      name,
      key,
      birthtime: new Date(status.birthtime).toISOString(),
      mtime: new Date(status.mtime).toISOString(),
    });
  });
  return fileList;
};

export const isNotLeafNode = (tree, key) => {
  for (const child of tree) {
    if (child.key === key) {
      return child.children ? child : false;
    }
    if (child.children) {
      const isNotLeaf = isNotLeafNode(child.children, key);
      if (isNotLeaf) return isNotLeaf;
    }
  }
  return false;
};

export const newProcess = (type, name, processTree, checkedTreeNode) => {
  if (type === 'process') {
    /**
     * 新建流程
     */
    // 如果是作为根结点添加, 那么逻辑如下
    if (
      checkedTreeNode === undefined ||
      !isNotLeafNode(processTree, checkedTreeNode)
    ) {
      const newProcessTree = processTree.concat({
        title: name,
        key: '0-' + processTree.length,
      });
      changeProcessTree(newProcessTree);
    } else {
      // 在这个项目目录下新增
      const parentNode = isNotLeafNode(processTree, checkedTreeNode);
      parentNode.children.push({
        title: name,
        key: parentNode.key + '-' + parentNode.children.length,
      });
      changeProcessTree(processTree.concat());
    }
  } else {
    /**
     * 新建项目的流程
     * 获取该工程下的流程树
     */
    const newProcessTree = processTree.concat({
      title: name,
      key: '0-' + processTree.length,
      children: [],
    });
    changeProcessTree(newProcessTree);
  }
};
