//import moment from moment
import React from 'react';
import { useSelector } from 'react-redux';
import { Input, message, Icon } from 'antd';
import uniqueId from 'lodash/uniqueId';
import moment from 'moment';
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
 * 删除树下的某个结点
 * @param {*} tree
 * @param {*} key
 */
export const deleteNodeByKey = (tree, key, parent = tree) => {
  for (const child of tree) {
    if (child.key === key) {
      if (Array.isArray(parent)) {
        let index = parent.findIndex(item => item.key === key);
        parent.splice(index, 1);
      } else {
        let index = parent.children.findIndex(item => item.key === key);
        parent.children.splice(index, 1);
      }
      return;
    }
    if (child.children) {
      deleteNodeByKey(child.children, key, child);
    }
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
  restoreCheckedTreeNode
) => {
  const node = findNodeByKey(tree, key);
  const parent = findParentNodeByKey(tree, key) || [];
  node.title = (
    <Input
      autoFocus
      defaultValue={node.title}
      onBlur={e => {
        const hasExist = Array.isArray(parent)
          ? parent.filter(item => item.title === e.target.value)
          : parent.children.filter(item => item.title === e.target.value);
        if (hasExist.length) {
          message.info('目录名或流程名重复!');
          return;
        }
        node.title = e.target.value;
        changeProcessTree([...tree]);
        persistentStorage();
        restoreCheckedTreeNode();
      }}
    />
  );
  changeProcessTree([...tree]);
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
          // message.success('保存成功');
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
        //icon: <Icon type="edit" />,
        isLeaf: true,
        data: {},
      });
    } else {
      //在这个项目目录下新增
      isDirNodeBool.children.push({
        title: name,
        key: uniqueId('key_'), // isDirNodeBool.key + '-' + isDirNodeBool.children.length,
        type: 'process',
        //icon: <Icon type="edit" />,
        isLeaf: true,
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
        //icon: <Icon type="unordered-list" />,
        children: [],
      });
    } else {
      isDirNodeBool.children.push({
        title: name,
        key: uniqueId('key_'), // uniqueId('key_'),sDirNodeBool.key + '-' + isDirNodeBool.children.length,
        type: 'dir',
        //icon: <Icon type="unordered-list" />,
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

export const formatDateTime = time => {
  return moment(time).format('YYYY-MM-DD HH:mm');
};
