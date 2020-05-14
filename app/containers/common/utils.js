//import moment from moment
import React from 'react';
import { useSelector } from 'react-redux';
import { Input, message, Icon } from 'antd';
import uniqueId from 'lodash/uniqueId';
import cloneDeep from 'lodash/cloneDeep';
import moment from 'moment';
import useGetDownloadPath from './DragEditorHeader/useHooks/useGetDownloadPath';
// import useTransformToPython from '../designerGraphBlock/layout/useHooks/useTransformToPython';
import {
  changeProcessTree,
  changeCheckedTreeNode,
  changeModuleTree,
  changeCheckedModuleTreeNode,
  clearGrapheditorData,
  changeSavingModuleData,
} from '../reduxActions';
import store from '../../store';
import { readDir } from '../../nodejs';
import event from '../designerGraphBlock/layout/eventCenter';
import PATH_CONFIG from '../../constants/localFilePath'; //'@/constants/localFilePath';
import { encrypt } from '../../login/utils'; //'@/login/utils';
import RenameInput from './components/RenameInput';
import transformEditorGraphData from '../designerGraphEdit/RPAcore';

const fs = require('fs');
const process = require('process');
const path = require('path');
const JSZIP = require('jszip');
const zip = new JSZIP();
const adm_zip = require('adm-zip');
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
      index: 0,
      style: {
        stroke: 'rgba(61, 109, 204, 1)',
        fill: '#ecf5f6',
      },
    },
  ],
};

export const transformPythonWithPoint = fromOrTo => {
  const {
    grapheditor: { graphData, graphDataMap, checkedGraphBlockId },
  } = store.getState();
  transformEditorGraphData(
    graphData,
    graphDataMap,
    checkedGraphBlockId,
    fromOrTo
  );
};

/**
 * 新建项目(已进行单元测试)
 * @param {*} name 项目名称
 * @param {*} callback 项目创建完成后的回调函数
 */
export const newProject = (name, callback) => {
  clearGrapheditorData();
  fs.mkdir(PATH_CONFIG('project', name), { recursive: true }, function(err) {
    if (!err) {
      // 修改左侧自定义目录树
      changeProcessTree([]);
      const initialProcessTreeJson = {
        processTree: [],
      };
      // 创建初始的描述文件
      fs.writeFileSync(
        PATH_CONFIG('project', name + '/manifest.json'),
        encrypt.argEncryptByDES(JSON.stringify(initialProcessTreeJson))
      );
      fs.mkdir(
        PATH_CONFIG('project', `${name}/${name}_module`),
        { recursive: true },
        function(err) {
          // callback();
          // 修改流程块树
          changeModuleTree([]);
          const initialModuleTreeJson = {
            moduleTree: [],
          };
          // 创建流程块树的描述文件
          fs.writeFileSync(
            PATH_CONFIG('project', `${name}/${name}_module/manifest.json`),
            encrypt.argEncryptByDES(JSON.stringify(initialModuleTreeJson))
          );
          callback && callback();
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
    const status = fs.statSync(PATH_CONFIG('project', name));
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
 * 判断为非叶子结点(已进行单元测试)
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

/**
 * 根据key值在tree中找到相应的节点(已进行单元测试)
 * @param {*} tree
 * @param {*} key
 */
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

const deleteFileByKey = (target, name, type) => {
  if (target.children) {
    traverseTree(target.children, item => {
      if (item.type === 'process') {
        if (type === 'process') {
          deleteFolderRecursive(
            PATH_CONFIG('project', `${name}/${item.title}`)
          );
        } else {
          fs.unlinkSync(
            PATH_CONFIG('project', `${name}/${name}_module/${item.title}.json`)
          );
        }
      }
    });
  } else {
    if (type === 'process') {
      deleteFolderRecursive(PATH_CONFIG('project', `${name}/${target.title}`));
    } else {
      fs.unlinkSync(
        PATH_CONFIG('project', `${name}/${name}_module/${target.title}.json`)
      );
    }
  }
};

/**
 * 根据key删除tree里面的节点（已进行单元测试）
 * @param {*} type 判断流程树or复用流程块树
 * @param {*} tree
 * @param {*} name 项目名
 * @param {*} key 删除的节点的key
 * @param {*} parent
 */
export const deleteNodeByKey = (type, tree, name, key, parent = tree) => {
  for (const child of tree) {
    if (child.key === key) {
      if (Array.isArray(parent)) {
        // parent为数组，parent = processTree时，在第一层
        // 父节点是否是数组
        let index = parent.findIndex(item => item.key === key); // 从数组中找到这个元素的index
        let target = parent.find(item => item.key === key);
        // 把该目录下的全部流程都删除
        deleteFileByKey(target, name, type);
        return parent.splice(index, 1)[0]; // 在tree中删掉该元素
      } else {
        // parent不是processTree的情况
        let index = parent.children.findIndex(item => item.key === key);
        const target = parent.children.find(item => item.key === key);
        deleteFileByKey(target, name, type);
        return parent.children.splice(index, 1)[0];
      }
    }
    if (child.children) {
      const bool = deleteNodeByKey(type, child.children, name, key, child);
      if (bool) return bool;
    }
  }
  return false;
};

/**
 * 递归删除文件夹(已完成单元测试)(以 deleteFolderRecursive 为准)
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

/**
 * 根据key重命名节点
 * @param {*} tree
 * @param {*} key
 * @param {*} persistentStorage
 * @param {*} restoreCheckedTreeNode
 * @param {*} name
 * @param {*} type
 */
export const renameNodeByKey = (
  tree,
  key,
  persistentStorage,
  restoreCheckedTreeNode,
  name,
  type
) => {
  const node = findNodeByKey(tree, key);
  const oldTitle = node.title;
  RenameInput(
    oldTitle,
    node,
    name,
    type,
    tree,
    persistentStorage,
    restoreCheckedTreeNode,
    getDecryptOrNormal
  );
  if (type === 'process') {
    console.log('change tree');
    changeProcessTree([...tree]);
  } else {
    console.log('change module tree');
    changeModuleTree([...tree]);
  }
  return node;
};

/**
 * 优化写法(已完成单元测试)
 * @param {*} dirName
 */
export function checkAndMakeDir(dirName) {
  // dirName: ../a/b/c
  if (!fs.existsSync(dirName)) {
    // path.dirname(dirName)  =>  ../a/b
    checkAndMakeDir(path.dirname(dirName));
    fs.mkdirSync(dirName);
  }
}

/**
 * 数据持久化保存到本地，按当前点击的流程保存(已完成单元测试)
 * @param {*} modifiedNodesArr
 * @param {*} processTree
 * @param {*} name
 * @param {*} node
 */
export const persistentStorage = (
  modifiedNodesArr,
  processTree,
  name,
  node
) => {
  let tree = cloneDeep(processTree);
  if (modifiedNodesArr) {
    traverseTree(tree, treeItem => {
      if (treeItem.type === 'process') {
        const find = modifiedNodesArr.find(item => item === treeItem.key);
        if (find) {
          fs.writeFileSync(
            PATH_CONFIG('project', `${name}/${treeItem.title}/manifest.json`),
            encrypt.argEncryptByDES(JSON.stringify(treeItem.data))
          );
        }
        treeItem.data = {};
      }
    });
  }
  updateProjextModifyTime(name);
  // 重新覆写processTree
  persistentManifest(tree, name, 'processTree');
  return tree;
};

/**
 * 保存流程树/流程块树的描述文件
 * @param {*} tree
 * @param {*} name 项目名
 * @param {*} type processTree/moduleTree
 */
export const persistentManifest = (tree, name, type, callback) => {
  let path = '';
  if (type === 'processTree') {
    path = `${name}/manifest.json`;
  } else {
    path = `${name}/${name}_module/manifest.json`;
  }
  fs.readFile(PATH_CONFIG('project', path), function(err, data) {
    if (!err) {
      let description = getDecryptOrNormal(data);
      fs.writeFileSync(
        PATH_CONFIG('project', path),
        encrypt.argEncryptByDES(
          JSON.stringify({
            ...description,
            [type]: tree,
          })
        )
      );
      callback && callback();
    }
  });
};

/**
 * 通过添加和删除文件来更新项目的更新时间
 * @param {*} projectName 项目名
 */
export const updateProjextModifyTime = projectName => {
  const updateTextPath = PATH_CONFIG('project', `${projectName}/update`);
  checkAndMakeDir(updateTextPath);
  deleteFolderRecursive(updateTextPath);
};

/**
 * 判断树中是否有重复的节点(已进行单元测试)
 * @param {*} tree
 * @param {*} new_key
 */
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
  return false;
};

/**
 * 获得Id(已进行单元测试)
 * @param {*} tree
 */
export const getUniqueId = (tree, keyType = 'key_') => {
  let new_key = uniqueId(keyType);

  while (true) {
    if (hasDuplicateKey(tree, new_key)) {
      new_key = uniqueId(keyType);
      continue;
    } else {
      return new_key;
    }
  }
};

export const uuid = () => {
  let s = [];
  const hexDigits = '0123456789abcdef';
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = '4'; // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = '_';
  return s.join('');
};

/**
 * 创建新流程
 * @param {*} type
 * @param {*} name
 * @param {*} processTree
 * @param {*} checkedTreeNode
 * @param {*} currentProject
 */
export const newProcessOrDir = (
  nodeType,
  name,
  tree,
  checkedTreeNode,
  currentProject,
  treeType
) => {
  let newTree = undefined;
  let isDirNodeBool = undefined;
  let isLeafNodeOrUndefined = undefined;
  let uniqueid = undefined;
  if (treeType === 'process') {
    isDirNodeBool = isDirNode(tree, checkedTreeNode);
    isLeafNodeOrUndefined = checkedTreeNode === undefined || !isDirNodeBool;
    uniqueid = getUniqueId(tree);
    if (nodeType === 'process') {
      checkAndMakeDir(PATH_CONFIG('project', `${currentProject}/${name}`));
      // 如果是作为根结点添加, 那么逻辑如下
      if (isLeafNodeOrUndefined) {
        newTree = tree.concat({
          title: name,
          key: uniqueid,
          type: 'process',
          isLeaf: true,
          data: {
            graphData: defaultGraphData,
          },
        });
      } else {
        //在这个项目目录下新增
        isDirNodeBool.children.push({
          title: name,
          key: uniqueid,
          type: 'process',
          isLeaf: true,
          data: {
            graphData: defaultGraphData,
          },
        });
        newTree = [...tree];
        // 告知processTree 设置展开该结点
        event.emit('expandKeys', isDirNodeBool.key);
      }
      clearGrapheditorData();
      // 提前执行更新流程图操作，防止changeCheckedTreeNode无法查找到流程图的节点信息
      changeProcessTree(newTree);
      changeCheckedTreeNode(uniqueid);
    } else {
      // 支持嵌套目录
      if (isLeafNodeOrUndefined) {
        newTree = tree.concat({
          title: name,
          key: uniqueid,
          type: 'dir',
          children: [],
        });
      } else {
        isDirNodeBool.children.push({
          title: name,
          key: uniqueid,
          type: 'dir',
          children: [],
        });
        newTree = [...tree];
      }
      changeProcessTree(newTree);
    }
    changeProcessTree(newTree);
  } else {
    isDirNodeBool = isDirNode(tree, checkedTreeNode);
    isLeafNodeOrUndefined = checkedTreeNode === undefined || !isDirNodeBool;
    uniqueid = getUniqueId(tree, 'key_module_');
    if (isLeafNodeOrUndefined) {
      newTree = tree.concat({
        title: name,
        key: uniqueid,
        type: 'dir',
        children: [],
      });
    } else {
      isDirNodeBool.children.push({
        title: name,
        key: uniqueid,
        type: 'dir',
        children: [],
      });
      newTree = [...tree];
    }
    changeModuleTree(newTree);
  }
  return [newTree, uniqueid];
};

/**
 * 校验流程名是否重复
 * @param {*} tree
 * @param {*} title
 * @param {*} checkedTreeNode
 */
export const isNameExist = (tree, title, checkedTreeNode, currentProject) => {
  const files = fs.readdirSync(PATH_CONFIG('project', currentProject));
  return files.find(item => item === title);
};

/**
 * 打开项目
 * @param {*} name 项目名
 */
export const openProject = name => {
  fs.readFile(PATH_CONFIG('project', `${name}/manifest.json`), function(
    err,
    data
  ) {
    if (!err) {
      const dirs = fs.readdirSync(PATH_CONFIG('project', name));
      const { processTree } = getDecryptOrNormal(data);
      console.log(processTree);
      // data.toString().indexOf('{') === -1
      //   ? JSON.parse(encrypt.argDecryptByDES(data.toString()))
      //   : JSON.parse(data.toString());
      // 遍历项目文件夹下面的流程文件夹，读取manifest.json里流程的数据，写入processTree
      dirs.forEach(dirItem => {
        if (dirItem !== 'manifest.json' && dirItem !== `${name}_module`) {
          try {
            const dirItemData = fs.readFileSync(
              PATH_CONFIG('project', `${name}/${dirItem}/manifest.json`)
            );
            const resultData = getDecryptOrNormal(dirItemData);

            // 以流程名为映射关系
            traverseTree(processTree, treeItem => {
              if (treeItem.title === dirItem) {
                treeItem.data = resultData;
              }
            });
          } catch (e) {
            console.log('该流程没有内容');
          }
        }
      });
      changeProcessTree(processTree);
      checkAndMakeDir(PATH_CONFIG('project', `${name}/${name}_module`));
      fs.readFile(
        PATH_CONFIG('project', `${name}/${name}_module/manifest.json`),
        function(err, data) {
          if (!err) {
            const { moduleTree } = getDecryptOrNormal(data);
            changeModuleTree(moduleTree);
          } else {
            changeModuleTree([]);
            const initialModuleTreeJson = {
              moduleTree: [],
            };
            // 创建流程块树的描述文件
            fs.writeFileSync(
              PATH_CONFIG('project', `${name}/${name}_module/manifest.json`),
              encrypt.argEncryptByDES(JSON.stringify(initialModuleTreeJson))
            );
          }
        }
      );
    } else {
      console.log(err);
    }
  });
};

export const formatDateTime = time => {
  return moment(time).format('YYYY-MM-DD HH:mm');
};

/**
 * 流程保存相关接口(已进行单元测试)
 * @param {*} processTree
 * @param {*} key
 * @param {*} modifyState
 */
export const changeModifyState = (processTree, key, modifyState) => {
  const node = findNodeByKey(processTree, key);
  if (!node) return null;
  node.hasModified = modifyState;
  changeProcessTree([...processTree]);
  return node;
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

export const getModifiedNodes = processTree => {
  const modifiedNodesArr = [];
  traverseTree(processTree, node => {
    if (node.hasModified) {
      modifiedNodesArr.push(node.key);
    }
  });
  return modifiedNodesArr;
};

/**
 * 下载发布流程到本地
 */
export const downProcessZipToLocal = (
  filePath,
  editorBlockPythonCode,
  processName,
  descText,
  versionText
) => {
  try {
    fs.mkdirSync(filePath);
  } catch (err) {
    deleteFolderRecursive(filePath);
    fs.mkdirSync(filePath);
  }
  fs.writeFileSync(filePath + '/test.py', editorBlockPythonCode);
  fs.writeFileSync(
    filePath + '/manifest.json',
    JSON.stringify({
      processName,
      descText,
      versionText,
    })
    // encrypt.argEncryptByDES(

    // )
  );
  readDir(zip, filePath);
  zip
    .generateAsync({
      // 设置压缩格式，开始打包
      type: 'nodebuffer', // nodejs用
      compression: 'DEFLATE', // 压缩算法
      compressionOptions: {
        // 压缩级别
        level: 9,
      },
    })
    .then(function(content) {
      deleteFolderRecursive(filePath);
      fs.writeFileSync(filePath + '.zip', content);
    });
};

export const addToReuse = () => {
  const {
    grapheditor: {
      graphDataMap,
      checkedGraphBlockId,
      moduleTree,
      currentProject,
      graphData,
    },
  } = store.getState();
  const checkNode = graphData.nodes.find(
    item => item.id === checkedGraphBlockId
  );
  if (
    checkNode.shape === 'start-node' ||
    checkNode.shape === 'rhombus-node' ||
    checkNode.shape === 'end-node'
  ) {
    console.log(checkNode);
    message.warning('不能复用此节点');
    return;
  }
  const { pythonCode, ...data } = graphDataMap.get(checkedGraphBlockId);
  const title = data.properties[0].value; // 标题
  const files = fs.readdirSync(
    PATH_CONFIG('project', `${currentProject}/${currentProject}_module`)
  );
  const item = files.find(item => item === `${title}.json`);
  if (!item) {
    // 把流程块数据写入文件
    fs.writeFileSync(
      PATH_CONFIG(
        'project',
        `${currentProject}/${currentProject}_module/${title}.json`
      ),
      encrypt.argEncryptByDES(
        JSON.stringify({
          graphDataMap: data,
        })
      )
    );
    const newModuleTree = [...moduleTree];
    newModuleTree.push({
      title: title,
      type: 'process',
      key: getUniqueId(moduleTree, 'key_module_'),
      graphDataMap: {},
    });
    changeModuleTree(newModuleTree);
    persistentManifest(newModuleTree, currentProject, 'moduleTree');
    // persistentModuleStorage(newModuleTree, currentProject);
  } else {
    message.info('已存在同名的流程块');
  }
};

export const exportCustomProcessBlock = () => {
  const getDownloadPath = useGetDownloadPath();

  const {
    grapheditor: { graphDataMap, checkedGraphBlockId },
  } = store.getState();

  getDownloadPath(filePath => {
    try {
      fs.mkdirSync(filePath);
    } catch (err) {
      deleteFolderRecursive(filePath);
      fs.mkdirSync(filePath);
    }

    const { pythonCode, ...data } = graphDataMap.get(checkedGraphBlockId);

    fs.writeFileSync(
      filePath + '/manifest.json',
      encrypt.argEncryptByDES(JSON.stringify(data)),
      function(err) {
        console.log(err);
      }
    );
    readDir(zip, filePath);
    zip
      .generateAsync({
        // 设置压缩格式，开始打包
        type: 'nodebuffer', // nodejs用
        compression: 'DEFLATE', // 压缩算法
        compressionOptions: {
          // 压缩级别
          level: 9,
        },
      })
      .then(function(content) {
        deleteFolderRecursive(filePath);
        fs.writeFileSync(filePath + '.zip', content);
        message.success('导出成功');
      });
  });
};

/**
 * 复制当前的流程块
 */
export const copyModule = () => {
  const {
    grapheditor: {
      graphDataMap, // 数据map
      checkedGraphBlockId, // 当前流程块的id
      currentProject,
    },
  } = store.getState();
  const { pythonCode, ...data } = graphDataMap.get(checkedGraphBlockId);
  changeSavingModuleData(data);
};

export const getChooseFilePath = (filePath, importType) => {
  console.log(importType);
  const unzip = new adm_zip(filePath[0]);
  const entry = unzip.getEntry('manifest.json');
  const text = unzip.readAsText(entry, 'utf8');
  const data = getDecryptOrNormal(text);

  const re = /([^\.\/\\]+)\.(?:[a-z]+)$/i;
  const fileName = re.exec(filePath[0])[1];
  const {
    grapheditor: {
      currentProject,
      moduleTree,
      processTree,
      currentCheckedModuleTreeNode,
      currentCheckedTreeNode,
    },
  } = store.getState();
  if (importType === 'processModule') {
    if (
      fs.existsSync(
        PATH_CONFIG(
          'project',
          `${currentProject}/${currentProject}_module/${fileName}.json`
        )
      )
    ) {
      message.info('该流程块已存在');
    } else {
      // 写入文件
      fs.writeFileSync(
        PATH_CONFIG(
          'project',
          `${currentProject}/${currentProject}_module/${fileName}.json`
        ),
        encrypt.argEncryptByDES(
          JSON.stringify({
            graphDataMap: data,
          })
        )
      );
      const newModuleTree = [...moduleTree];
      // 没有选中流程块或者目录
      if (!currentCheckedModuleTreeNode) {
        newModuleTree.push({
          title: fileName,
          type: 'process',
          key: getUniqueId(newModuleTree, 'key_module_'),
          graphDataMap: {},
        });
      } else {
        // 对redux中的moduleTree进行修改
        traverseTree(newModuleTree, item => {
          if (currentCheckedModuleTreeNode === item.key) {
            // 选中的是流程
            if (item.type === 'process') {
              newModuleTree.push({
                title: fileName,
                type: 'process',
                key: getUniqueId(newModuleTree, 'key_module_'),
                graphDataMap: {},
              });
            } else {
              // 选中的是目录
              item.children.push({
                title: fileName,
                type: 'process',
                key: getUniqueId(newModuleTree, 'key_module_'),
                graphDataMap: {},
              });
            }
          }
        });
      }
      changeModuleTree(newModuleTree);
      persistentManifest(newModuleTree, currentProject, 'moduleTree');
      // persistentModuleStorage(newModuleTree, currentProject);
    }
  } else {
    if (
      fs.existsSync(PATH_CONFIG('project', `${currentProject}/${fileName}`))
    ) {
      message.info('流程已存在');
    } else {
      let newProcessTree = undefined;
      const isDirNodeBool = isDirNode(processTree, currentCheckedTreeNode);
      const isLeafNodeOrUndefined =
        currentCheckedTreeNode === undefined || !isDirNodeBool;
      const uniqueid = getUniqueId(processTree);
      checkAndMakeDir(PATH_CONFIG('project', `${currentProject}/${fileName}`));
      if (isLeafNodeOrUndefined) {
        newProcessTree = processTree.concat({
          title: fileName,
          key: uniqueid,
          type: 'process',
          isLeaf: true,
          data,
        });
      } else {
        isDirNodeBool.children.push({
          title: fileName,
          key: uniqueid,
          type: 'process',
          isLeaf: true,
          data,
        });
        newProcessTree = [...processTree];
        event.emit('expandKeys', isDirNodeBool.key);
      }
      changeProcessTree(newProcessTree);
      changeCheckedTreeNode(uniqueid);
      persistentStorage([uniqueid], newProcessTree, currentProject, uniqueid);
    }
  }
};

export const getDecryptOrNormal = data => {
  if (data.toString().indexOf('{') === -1) {
    return JSON.parse(encrypt.argDecryptByDES(data.toString()));
  } else {
    return JSON.parse(data.toString());
  }
};

/**
 * 查找项目名是否存在
 * @param {*} projectName 项目名
 */
export const checkProjectExist = projectName => {
  const projectPath = PATH_CONFIG('project', `${projectName}`);
  return fs.existsSync(projectPath);
};
