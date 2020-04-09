//import moment from moment
import React from 'react';
import { useSelector } from 'react-redux';
import { Input, message, Icon } from 'antd';
import uniqueId from 'lodash/uniqueId';
import moment from 'moment';
import {
  changeProcessTree,
  changeCheckedTreeNode,
  changeModuleTree,
  changeCheckedModuleTreeNode,
  clearGrapheditorData,
} from '../reduxActions';
import store from '../../store';
import { readDir } from '../../nodejs';
import event from '../designerGraphBlock/layout/eventCenter';
import PATH_CONFIG from '@/constants/localFilePath';

const fs = require('fs');
const process = require('process');
const path = require('path');
const JSZIP = require('jszip');
const zip = new JSZIP();

/**
 * 新建项目
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
        JSON.stringify(initialProcessTreeJson)
      );
      fs.mkdir(
        PATH_CONFIG('project', `${name}/${name}_module`),
        { recursive: true },
        function(err) {
          callback();
          // 修改流程块树
          changeModuleTree([]);
          const initialModuleTreeJson = {
            moduleTree: [],
          };
          // 创建流程块树的描述文件
          fs.writeFileSync(
            PATH_CONFIG('project', `${name}/${name}_module/manifest.json`),
            JSON.stringify(initialModuleTreeJson)
          );
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
export const deleteNodeByKey = (type, tree, name, key, parent = tree) => {
  for (const child of tree) {
    if (child.key === key) {
      if (Array.isArray(parent)) {
        // parent为数组，parent = processTree时，在第一层
        // 父节点是否是数组
        let index = parent.findIndex(item => item.key === key); // 从数组中找到这个元素的index
        let target = parent.find(item => item.key === key);
        // 把该目录下的全部流程都删除
        if (target.children) {
          traverseTree(target.children, item => {
            if (item.type === 'process') {
              if (type === 'process') {
                deleteFolderRecursive(
                  PATH_CONFIG('project', `${name}/${item.title}`)
                );
              } else {
                fs.unlinkSync(
                  PATH_CONFIG(
                    'project',
                    `${name}/${name}_module/${item.title}.json`
                  )
                );
              }
            }
          });
        } else {
          if (type === 'process') {
            deleteFolderRecursive(
              PATH_CONFIG('project', `${name}/${target.title}`)
            );
          } else {
            fs.unlinkSync(
              PATH_CONFIG(
                'project',
                `${name}/${name}_module/${target.title}.json`
              )
            );
          }
        }
        parent.splice(index, 1); // 在tree中删掉该元素
      } else {
        // parent不是processTree的情况
        let index = parent.children.findIndex(item => item.key === key);
        const target = parent.children.find(item => item.key === key);
        if (target.children) {
          traverseTree(target.children, item => {
            if (item.type === 'process') {
              if (type === 'process') {
                deleteFolderRecursive(
                  PATH_CONFIG('project', `${name}/${item.title}`)
                );
              } else {
                fs.unlinkSync(
                  PATH_CONFIG(
                    'project',
                    `${name}/${name}_module/${item.title}.json`
                  )
                );
              }
            }
          });
        } else {
          if (type === 'process') {
            deleteFolderRecursive(
              PATH_CONFIG('project', `${name}/${target.title}`)
            );
          } else {
            fs.unlinkSync(
              PATH_CONFIG(
                'project',
                `${name}/${name}_module/${target.title}.json`
              )
            );
          }
        }
        parent.children.splice(index, 1);
      }
      return;
    }
    if (child.children) {
      deleteNodeByKey(type, child.children, name, key, child);
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
  name,
  type
) => {
  const node = findNodeByKey(tree, key);
  // const parent = findParentNodeByKey(tree, key) || [];
  const oldTitle = node.title;
  console.log(node);
  console.log(persistentStorage);
  if (type === 'process') {
    node.title = (
      <Input
        autoFocus
        defaultValue={node.title}
        onBlur={e => {
          const newTitle = e.target.value;
          if (node.type === 'process') {
            const dirs = fs.readdirSync(PATH_CONFIG('project', name));
            const item = dirs.find(item => newTitle === item);
            if (!item) {
              node.title = newTitle;
              fs.rename(
                PATH_CONFIG('project', `${name}/${oldTitle}`),
                PATH_CONFIG('project', `${name}/${newTitle}`),
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
              message.info('重复命名');
              node.title = oldTitle;
              changeProcessTree([...tree]);
              persistentStorage();
              restoreCheckedTreeNode();
              return;
            }
          } else {
            node.title = newTitle;
            changeProcessTree([...tree]);
            persistentStorage();
            restoreCheckedTreeNode();
          }
        }}
      />
    );
    changeProcessTree([...tree]);
  } else {
    node.title = (
      <Input
        autoFocus
        defaultValue={node.title}
        onBlur={e => {
          const newTitle = e.target.value;
          if (node.type === 'process') {
            const dirs = fs.readdirSync(
              PATH_CONFIG('project', `${name}/${name}_module`)
            );
            const item = dirs.find(item => `${newTitle}.json` === item);
            if (!item) {
              node.title = newTitle;
              fs.rename(
                PATH_CONFIG(
                  'project',
                  `${name}/${name}_module/${oldTitle}.json`
                ),
                PATH_CONFIG(
                  'project',
                  `${name}/${name}_module/${newTitle}.json`
                ),
                err => {
                  if (err) {
                    message.error(err);
                  }
                }
              );
              changeModuleTree([...tree]);
              persistentStorage();
              restoreCheckedTreeNode();
            } else {
              message.info('重复命名');
              node.title = oldTitle;
              changeModuleTree([...tree]);
              persistentStorage();
              restoreCheckedTreeNode();
              return;
            }
          } else {
            node.title = newTitle;
            changeModuleTree([...tree]);
            persistentStorage();
            restoreCheckedTreeNode();
          }
        }}
      />
    );
    changeModuleTree([...tree]);
  }
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
export const persistentStorage = (
  modifiedNodesArr,
  processTree,
  name,
  node
) => {
  let tree = JSON.parse(JSON.stringify(processTree));
  if (modifiedNodesArr) {
    traverseTree(tree, treeItem => {
      if (treeItem.type === 'process') {
        const find = modifiedNodesArr.find(item => item === treeItem.key);
        if (find) {
          fs.writeFileSync(
            PATH_CONFIG('project', `${name}/${treeItem.title}/manifest.json`),
            JSON.stringify(treeItem.data)
          );
        }
        treeItem.data = {};
      }
    });
  } else {
    // 遍历树
    traverseTree(tree, treeItem => {
      // 匹配点击的流程
      if (treeItem.type === 'process') {
        if (treeItem.key === node) {
          fs.writeFileSync(
            PATH_CONFIG('project', `${name}/${treeItem.title}/manifest.json`),
            JSON.stringify(treeItem.data)
          );
          treeItem.data = {};
        }
      }
    });
  }
  // 重新覆写processTree
  fs.readFile(PATH_CONFIG('project', `${name}/manifest.json`), function(
    err,
    data
  ) {
    if (!err) {
      let description = JSON.parse(data.toString());
      fs.writeFile(
        PATH_CONFIG('project', `${name}/manifest.json`),
        JSON.stringify({
          ...description,
          processTree: tree,
        }),
        function(err) {
          if (err) {
            console.error(err);
          }
        }
      );
    }
  });
};

export const persistentModuleStorage = (moduleTree, name, node) => {
  // let tree = JSON.parse(JSON.stringify(moduleTree));
  fs.readFile(
    PATH_CONFIG('project', `${name}/${name}_module/manifest.json`),
    function(err, data) {
      if (!err) {
        let description = JSON.parse(data.toString());
        fs.writeFile(
          PATH_CONFIG('project', `${name}/${name}_module/manifest.json`),
          JSON.stringify({
            ...description,
            moduleTree,
          }),
          function(err) {
            if (err) {
              console.error(err);
            }
          }
        );
      }
    }
  );
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

const getModuleUniqueId = tree => {
  let new_key = uniqueId('key_module_');
  while (true) {
    if (hasDuplicateKey(tree, new_key)) {
      new_key = uniqueId('key_module_');
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
          fill: '#ecf5f6',
        },
      },
    ],
  };
  if (type === 'process') {
    checkAndMakeDir(PATH_CONFIG('project', `${currentProject}/${name}`));
    // 如果是作为根结点添加, 那么逻辑如下
    if (isLeafNodeOrUndefined) {
      newProcessTree = processTree.concat({
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
      newProcessTree = [...processTree];
    }
    changeProcessTree(newProcessTree);
  }
  changeProcessTree(newProcessTree);
  return [newProcessTree, uniqueid];
};

export const newModuleDir = (
  name,
  moduleTree,
  checkedModuleTreeNode,
  currentProject
) => {
  let newModuleTree = undefined;
  const uniqueid = getModuleUniqueId(moduleTree);
  const isDirNodeBool = isDirNode(moduleTree, checkedModuleTreeNode);
  const isLeafNodeOrUndefined =
    checkedModuleTreeNode === undefined || !isDirNodeBool;
  if (isLeafNodeOrUndefined) {
    newModuleTree = moduleTree.concat({
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
    newModuleTree = [...moduleTree];
  }
  changeModuleTree(newModuleTree);
  return [newModuleTree, uniqueid];
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
  // const isDirNodeBool = isDirNode(tree, checkedTreeNode);
  // // 不在同级下建目录或流程跳过检验
  // if (!isDirNodeBool) return false;
  // const children = isDirNodeBool.children;
  // return children.find(item => item.title === title);
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
      const { processTree } = JSON.parse(data.toString());
      // 遍历项目文件夹下面的流程文件夹，读取manifest.json里流程的数据，写入processTree
      dirs.forEach(dirItem => {
        if (dirItem !== 'manifest.json' && dirItem !== `${name}_module`) {
          try {
            const data = JSON.parse(
              fs.readFileSync(
                PATH_CONFIG('project', `${name}/${dirItem}/manifest.json`)
              )
            );

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
      fs.readFile(
        PATH_CONFIG('project', `${name}/${name}_module/manifest.json`),
        function(err, data) {
          const { moduleTree } = JSON.parse(data.toString());
          console.log(moduleTree);
          changeModuleTree(moduleTree);
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

export const setNodeModifiedState = (processTree, checkedNode) => {
  traverseTree(processTree, node => {
    if (node.key === checkedNode) {
      node.hasModified = false;
    }
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
function deleteFolder(path) {
  let files = [];
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach(function(file, index) {
      let curPath = path + '/' + file;
      if (fs.statSync(curPath).isDirectory()) {
        // recurse
        deleteFolder(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

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
    deleteFolder(filePath);
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
      deleteFolder(filePath);
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
    },
  } = store.getState();
  // console.log(graphDataMap, checkedGraphBlockId);
  // console.log(graphDataMap.get(checkedGraphBlockId));
  const { pythonCode, ...data } = graphDataMap.get(checkedGraphBlockId);
  console.log(data); // 数据
  const title = data.properties[0].value; // 标题
  const item = moduleTree.find(item => item.title === title); //树中是否存在该流程块
  if (!item) {
    // 把流程块数据写入文件
    fs.writeFileSync(
      PATH_CONFIG(
        'project',
        `${currentProject}/${currentProject}_module/${title}.json`
      ),
      JSON.stringify({
        graphDataMap: JSON.stringify(data),
      })
    );
    const newModuleTree = [...moduleTree];
    newModuleTree.push({
      title: title,
      type: 'process',
      key: getModuleUniqueId(moduleTree),
      graphDataMap: {},
    });
    changeModuleTree(newModuleTree);
    console.log(newModuleTree);
    fs.readFile(
      PATH_CONFIG(
        'project',
        `${currentProject}/${currentProject}_module/manifest.json`
      ),
      function(err, data) {
        if (!err) {
          let description = JSON.parse(data.toString());
          console.log(description);
          fs.writeFile(
            PATH_CONFIG(
              'project',
              `${currentProject}/${currentProject}_module/manifest.json`
            ),
            JSON.stringify({
              ...description,
              moduleTree: newModuleTree,
            }),
            function(err) {
              if (err) {
                console.error(err);
              }
            }
          );
        }
      }
    );
  } else {
    message.info('已存在同名的流程块');
  }
};
