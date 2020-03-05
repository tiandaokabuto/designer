//import moment from moment
import { useSelector } from 'react-redux';
import uniqueId from 'lodash/uniqueId';
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

/**
 * 判断为非叶子结点
 * @param {*} tree
 * @param {*} key
 */
export const isDirNode = (tree, key) => {
  for (const child of tree) {
    if (child.key === key) {
      return child.type === 'dir' ? child : false;
    }
    if (child.children) {
      const bool = isDirNode(child.children, key);
      if (bool) return bool;
    }
  }
  return false;
};

export const findNodeByKey = (tree, key) => {
  for (const child of tree) {
    if (child.key === key) {
      return child;
    }
    if (child.children) {
      let bool = findNodeByKey(child.children, key);
      if (bool) return bool;
    }
  }
  return false;
};

/**
 * 数据持久化保存到本地
 * @param {*} processTree
 * @param {*} name
 */
export const persistentStorage = (processTree, name) => {
  // 重新覆写processTree
  fs.readFile(`${process.cwd()}/project/${name}/manifest.json`, function(
    err,
    data
  ) {
    if (!err) {
      let description = JSON.parse(data.toString());
      fs.writeFile(
        `${process.cwd()}/project/${name}/manifest.json`,
        JSON.stringify({
          ...description,
          processTree,
        }),
        function(err) {
          if (err) {
            console.error(err);
          }
          console.log('----------新增成功-------------');
        }
      );
    }
  });
};

/**
 * 创建新流程
 * @param {*} type
 * @param {*} name
 * @param {*} processTree
 * @param {*} checkedTreeNode
 */

export const newProcess = (type, name, processTree, checkedTreeNode) => {
  let newProcessTree = undefined;
  const isDirNodeBool = isDirNode(processTree, checkedTreeNode);
  const isLeafNodeOrUndefined = checkedTreeNode === undefined || !isDirNodeBool;
  if (type === 'process') {
    // 如果是作为根结点添加, 那么逻辑如下
    if (isLeafNodeOrUndefined) {
      newProcessTree = processTree.concat({
        title: name,
        key: uniqueId('key_'), //'0-' + processTree.length,
        type: 'process',
        data: {},
      });
    } else {
      //在这个项目目录下新增
      isDirNodeBool.children.push({
        title: name,
        key: uniqueId('key_'), // isDirNodeBool.key + '-' + isDirNodeBool.children.length,
        type: 'process',
        data: {},
      });
      newProcessTree = [...processTree];
    }
  } else {
    // 支持嵌套目录
    if (isLeafNodeOrUndefined) {
      newProcessTree = processTree.concat({
        title: name,
        key: uniqueId('key_'), // '0-' + processTree.length,
        type: 'dir',
        children: [],
      });
    } else {
      isDirNodeBool.children.push({
        title: name,
        key: uniqueId('key_'), // uniqueId('key_'),sDirNodeBool.key + '-' + isDirNodeBool.children.length,
        type: 'dir',
        children: [],
      });
      newProcessTree = [...processTree];
    }
  }
  changeProcessTree(newProcessTree);
  return newProcessTree;
};

/**
 * 校验流程名是否重复
 * @param {*} tree
 * @param {*} title
 * @param {*} checkedTreeNode
 */
export const isNameExist = (tree, title, checkedTreeNode) => {
  const isDirNodeBool = isDirNode(tree, checkedTreeNode);
  // 不在同级下建目录或流程跳过检验
  if (!isDirNodeBool) return false;
  const children = isDirNodeBool.children;
  return children.find(item => item.title === title);
};

export const openProject = name => {
  fs.readFile(`${process.cwd()}/project/${name}/manifest.json`, function(
    err,
    data
  ) {
    if (!err) {
      const { processTree } = JSON.parse(data.toString());
      changeProcessTree(processTree);
    } else {
      console.log(err);
    }
  });
};
