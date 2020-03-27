//import moment from moment
import React from 'react';
import { useSelector } from 'react-redux';
import { Input, message, Icon } from 'antd';
import uniqueId from 'lodash/uniqueId';
import moment from 'moment';
import {
  changeProcessTree,
  changeCheckedTreeNode,
  clearGrapheditorData
} from '../reduxActions';
import event from '../designerGraphBlock/layout/eventCenter';
const fs = require('fs');
const process = require('process');
const path = require('path');

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
        processTree: []
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
  try {
    fs.mkdirSync(`${process.cwd()}/project`);
  } catch (err) {}
  const result = fs.readdirSync(`${process.cwd()}/project`);
  const fileList = [];
  result.forEach((name, key) => {
    const status = fs.statSync(`${process.cwd()}/project/` + name);
    fileList.push({
      name,
      key,
      birthtime: new Date(status.birthtime).toISOString(),
      mtime: new Date(status.mtime).toISOString()
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
 * 删除树下的某个结点
 * @param {*} tree
 * @param {*} key
 */
export const deleteNodeByKey = (tree, name, key, parent = tree) => {
  for (const child of tree) {
    if (child.key === key) {
      if (Array.isArray(parent)) {
        // parent为数组，parent = processTree时，在第一层
        console.log(parent, 'isArray---true');
        // 父节点是否是数组
        let index = parent.findIndex(item => item.key === key); // 从数组中找到这个元素的index
        let target = parent.find(item => item.key === key);
        // 把该目录下的全部流程都删除
        if (target.children) {
          traverseTree(target.children, item => {
            if (item.type === 'process') {
              deleteFolderRecursive(
                `${process.cwd()}/project/${name}/${item.title}`
              );
            }
          });
        } else {
          deleteFolderRecursive(
            `${process.cwd()}/project/${name}/${target.title}`
          );
        }
        parent.splice(index, 1); // 在tree中删掉该元素
      } else {
        console.log(key);
        // parent不是processTree的情况
        console.log(JSON.parse(JSON.stringify(parent)), 'isArray---false');
        console.log(
          JSON.parse(JSON.stringify(parent.children)),
          'isArray---false'
        );
        let index = parent.children.findIndex(item => item.key === key);
        const target = parent.children.find(item => item.key === key);
        console.log(target);
        if (target.children) {
          traverseTree(target.children, item => {
            if (item.type === 'process') {
              deleteFolderRecursive(
                `${process.cwd()}/project/${name}/${item.title}`
              );
            }
          });
        } else {
          deleteFolderRecursive(
            `${process.cwd()}/project/${name}/${target.title}`
          );
        }
        parent.children.splice(index, 1);
      }
      return;
    }
    if (child.children) {
      console.log('递归');
      console.log(child);
      deleteNodeByKey(child.children, name, key, child);
    }
  }
};

/**
 * 递归删除文件夹
 * @param {*} path 路径
 */
export const deleteFolderRecursive = path => {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file) {
      var curPath = path + '/' + file;
      if (fs.statSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

export const findParentNodeByKey = (tree, key, parent = tree) => {
  for (const child of tree) {
    if (child.key === key) {
      return parent;
    }
    if (child.children) {
      const bool = findParentNodeByKey(child.children, key, child);
      if (bool) return bool;
    }
  }
};

export const renameNodeByKey = (
  tree,
  key,
  persistentStorage,
  restoreCheckedTreeNode,
  name
) => {
  const node = findNodeByKey(tree, key);
  const parent = findParentNodeByKey(tree, key) || [];
  const oldTitle = node.title;
  console.log(node, parent, key, tree, name);
  node.title = (
    <Input
      autoFocus
      defaultValue={node.title}
      onBlur={e => {
        if (node.type === 'process') {
          const hasExist = Array.isArray(parent)
            ? parent.filter(item => item.title === e.target.value)
            : parent.children.filter(item => item.title === e.target.value);
          console.log(hasExist);
          if (hasExist.length) {
            message.info('目录名或流程名重复!');
            return;
          }
          node.title = e.target.value;
          fs.rename(
            `${process.cwd()}/project/${name}/${oldTitle}`,
            `${process.cwd()}/project/${name}/${node.title}`,
            err => {
              if (err) {
                message.error(err);
              }
            }
          );
          changeProcessTree([...tree]);
          persistentStorage();
          restoreCheckedTreeNode();
        } else {
          node.title = e.target.value;
          changeProcessTree([...tree]);
          persistentStorage();
          restoreCheckedTreeNode();
        }
      }}
    />
  );
  changeProcessTree([...tree]);
};

/**
 * 检查和创建路径
 * @param {} dirName 路径
 */
export function checkAndMakeDir(dirName) {
  if (fs.existsSync(dirName)) {
    return true;
  } else {
    if (checkAndMakeDir(path.dirname(dirName))) {
      fs.mkdirSync(dirName);
      return true;
    }
  }
}

/**
 * 数据持久化保存到本地，按当前点击的流程保存
 * @param {*} processTree
 * @param {*} name
 */
export const persistentStorage = (processTree, name, node) => {
  // 遍历树
  traverseTree(processTree, treeItem => {
    // 匹配点击的流程
    if (treeItem.key === node) {
      console.log(treeItem);
      if (treeItem.type === 'process') {
        fs.writeFile(
          `${process.cwd()}/project/${name}/${treeItem.title}/manifest.json`,
          JSON.stringify(treeItem.data),
          err => {
            if (err) {
              console.log(err);
            }
          }
        );
      }
    }
  });
  // 重新覆写processTree
  fs.readFile(`${process.cwd()}/project/${name}/manifest.json`, function(
    err,
    data
  ) {
    if (!err) {
      let description = JSON.parse(data.toString());
      let tree = JSON.parse(JSON.stringify(processTree));
      // 保存之前先把流程的data清空
      traverseTree(tree, item => {
        if (item.type === 'process') {
          item.data = {};
        }
      });
      fs.writeFile(
        `${process.cwd()}/project/${name}/manifest.json`,
        JSON.stringify({
          ...description,
          processTree: tree
        }),
        function(err) {
          if (err) {
            console.error(err);
          }
          // message.success('保存成功');
          console.log('----------新增成功-------------');
        }
      );
    }
  });
};

export const hasDuplicateKey = (tree, new_key) => {
  for (const child of tree) {
    if (child.key === new_key) {
      return true;
    }
    if (child.children) {
      let bool = hasDuplicateKey(child.children, new_key);
      if (bool) return bool;
    }
  }
};

const getUniqueId = tree => {
  let new_key = uniqueId('key_');
  while (true) {
    if (hasDuplicateKey(tree, new_key)) {
      new_key = uniqueId('key_');
      continue;
    } else {
      return new_key;
    }
  }
};

/**
 * 创建新流程
 * @param {*} type
 * @param {*} name
 * @param {*} processTree
 * @param {*} checkedTreeNode
 */

export const newProcess = (
  type,
  name,
  processTree,
  checkedTreeNode,
  currentProject
) => {
  let newProcessTree = undefined;
  const isDirNodeBool = isDirNode(processTree, checkedTreeNode);
  const isLeafNodeOrUndefined = checkedTreeNode === undefined || !isDirNodeBool;
  const uniqueid = getUniqueId(processTree);
  // defaultGraphData: 新流程图加一个开始节点
  const defaultGraphData = {
    nodes: [
      {
        type: 'node',
        size: '40*40',
        shape: 'start-node',
        color: '#FA8C16',
        label: '开始',
        x: 436,
        y: 30,
        id: 'startNode',
        index: 0,
        style: {
          stroke: 'rgba(61, 109, 204, 1)',
          fill: '#ecf5f6'
        }
      }
    ]
  };
  if (type === 'process') {
    console.log(type, name, currentProject, checkedTreeNode);
    checkAndMakeDir(`${process.cwd()}/project/${currentProject}/${name}`);
    // 如果是作为根结点添加, 那么逻辑如下
    if (isLeafNodeOrUndefined) {
      newProcessTree = processTree.concat({
        title: name,
        key: uniqueid, //'0-' + processTree.length,
        type: 'process',
        //icon: <Icon type="edit" />,
        isLeaf: true,
        data: {
          graphData: defaultGraphData
        }
      });
    } else {
      //在这个项目目录下新增
      isDirNodeBool.children.push({
        title: name,
        key: uniqueid, // isDirNodeBool.key + '-' + isDirNodeBool.children.length,
        type: 'process',
        //icon: <Icon type="edit" />,
        isLeaf: true,
        data: {
          graphData: defaultGraphData
        }
      });
      newProcessTree = [...processTree];
      // 告知processTree 设置展开该结点
      event.emit('expandKeys', isDirNodeBool.key);
    }
    clearGrapheditorData();
    // 提前执行更新流程图操作，防止changeCheckedTreeNode无法查找到流程图的节点信息
    changeProcessTree(newProcessTree);
    changeCheckedTreeNode(uniqueid);
  } else {
    // 支持嵌套目录
    if (isLeafNodeOrUndefined) {
      newProcessTree = processTree.concat({
        title: name,
        key: uniqueid, // '0-' + processTree.length,
        type: 'dir',
        //icon: <Icon type="unordered-list" />,
        children: []
      });
    } else {
      isDirNodeBool.children.push({
        title: name,
        key: uniqueid, // uniqueId('key_'),sDirNodeBool.key + '-' + isDirNodeBool.children.length,
        type: 'dir',
        //icon: <Icon type="unordered-list" />,
        children: []
      });
      newProcessTree = [...processTree];
    }
    changeProcessTree(newProcessTree);
  }
  changeProcessTree(newProcessTree);
  return [newProcessTree, uniqueid];
};

/**
 * 校验流程名是否重复
 * @param {*} tree
 * @param {*} title
 * @param {*} checkedTreeNode
 */
export const isNameExist = (tree, title, checkedTreeNode, currentProject) => {
  console.log(checkedTreeNode);
  const files = fs.readdirSync(`${process.cwd()}/project/${currentProject}`);
  return files.find(item => item === title);
  // const isDirNodeBool = isDirNode(tree, checkedTreeNode);
  // console.log(isDirNodeBool);
  // // 不在同级下建目录或流程跳过检验
  // if (!isDirNodeBool) return false;
  // const children = isDirNodeBool.children;
  // return children.find(item => item.title === title);
};

export const isDirNameExist = (
  tree,
  title,
  checkedTreeNode,
  currentProject
) => {
  console.log(tree, title, checkedTreeNode, currentProject);
};

/**
 * 打开项目
 * @param {*} name 项目名
 */
export const openProject = name => {
  console.log('打开');
  fs.readFile(`${process.cwd()}/project/${name}/manifest.json`, function(
    err,
    data
  ) {
    if (!err) {
      const dirs = fs.readdirSync(`${process.cwd()}/project/${name}`);
      const { processTree } = JSON.parse(data.toString());
      // 遍历项目文件夹下面的流程文件夹，读取manifest.json里流程的数据，写入processTree
      // console.log(dirs);
      dirs.forEach(dirItem => {
        // console.log(dirItem);
        if (dirItem !== 'manifest.json') {
          try {
            const data = JSON.parse(
              fs.readFileSync(
                `${process.cwd()}/project/${name}/${dirItem}/manifest.json`
              )
            );
            if (dirItem === '1') {
              console.log(data);
            }

            // 以流程名为映射关系
            traverseTree(processTree, treeItem => {
              if (treeItem.title === dirItem) {
                treeItem.data = data;
              }
            });
          } catch (e) {
            console.log('该流程没有内容');
          }
        }
      });
      changeProcessTree(processTree);
    } else {
      console.log(err);
    }
  });
};

export const formatDateTime = time => {
  return moment(time).format('YYYY-MM-DD HH:mm');
};

// 流程保存相关接口
export const changeModifyState = (processTree, key, modifyState) => {
  const node = findNodeByKey(processTree, key);
  if (!node) return;
  node.hasModified = true;
  changeProcessTree([...processTree]);
};

export const hasNodeModified = (processTree, key) => {
  const node = findNodeByKey(processTree, key);
  return node.hasModified;
};

export const traverseTree = (tree, callback) => {
  for (const child of tree) {
    callback && callback(child);
    if (child.children) {
      traverseTree(child.children, callback);
    }
  }
};

export const setAllModifiedState = (processTree, state = false) => {
  traverseTree(processTree, node => {
    node.hasModified = state;
  });
  changeProcessTree([...processTree]);
};

export const existModifiedNode = processTree => {
  let flag = false;
  // FIXME...
  try {
    traverseTree(processTree, node => {
      flag = node.hasModified;
      if (flag) throw new Error('flag has been true');
    });
  } catch (err) {
    console.log(err);
  } finally {
    return flag;
  }
};
