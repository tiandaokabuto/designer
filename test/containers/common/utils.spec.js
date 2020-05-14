import {
  isDirNode,
  findNodeByKey,
  hasDuplicateKey,
  deleteNodeByKey,
  getUniqueId,
  changeModifyState,
  checkAndMakeDir,
  deleteFolderRecursive,
  newProject,
  persistentStorage,
  renameNodeByKey,
  persistentManifest,
  getDecryptOrNormal,
} from '../../../app/containers/common/utils';
import PATH_CONFIG from '../../../app/constants/localFilePath';

let processTree = null;
let dir = null;
let process = null;
const fs = require('fs');
beforeEach(() => {
  process = {
    type: 'process',
    key: '2-1',
    title: '测试流程三',
    data: {
      name: '21',
    },
  };
  dir = {
    type: 'dir',
    key: '1-3',
    title: '测试目录一',
    children: [
      process,
      {
        type: 'dir',
        title: '测试目录二',
        key: '2-2',
        children: [],
      },
      {
        type: 'process',
        key: '2-3',
        title: '测试流程四',
        data: {
          name: '23',
        },
      },
    ],
  };
  processTree = [
    {
      type: 'process',
      key: '1-1',
      title: '测试流程一',
      data: {
        name: '11',
      },
    },
    {
      type: 'process',
      key: '1-2',
      title: '测试流程二',
      data: {
        name: '12',
      },
    },
    dir,
    {
      type: 'process',
      key: '1-4',
      title: '测试流程五',
      data: {
        name: '14',
      },
    },
  ];
});

describe('test utils', () => {
  it('test isDirNode', () => {
    expect(isDirNode(processTree, '1-1')).toBeFalsy();
    expect(isDirNode(processTree, '1-3')).toBeTruthy();
    expect(isDirNode(processTree, '2-2')).toBeTruthy();
    expect(isDirNode(processTree, '2-3')).toBeFalsy();
  });
  it('test findNodeByKey', () => {
    expect(findNodeByKey(processTree, '1-1')).toEqual({
      type: 'process',
      key: '1-1',
      title: '测试流程一',
      data: {
        name: '11',
      },
    });
    expect(findNodeByKey(processTree, '2-3')).toEqual({
      type: 'process',
      key: '2-3',
      title: '测试流程四',
      data: {
        name: '23',
      },
    });
    expect(findNodeByKey(processTree, '3-5')).toBeFalsy();
    expect(findNodeByKey(processTree, '1-3')).toBe(dir);
  });
  it('test hasDuplicateKey', () => {
    expect(hasDuplicateKey(processTree, '1-1')).toBeTruthy();
    expect(hasDuplicateKey(processTree, '1-3')).toBeTruthy();
    expect(hasDuplicateKey(processTree, '1-5')).toBeFalsy();
    expect(hasDuplicateKey(processTree, '2-1')).toBeTruthy();
    expect(hasDuplicateKey(processTree, '2-3')).toBeTruthy();
    expect(hasDuplicateKey(processTree, '2-6')).toBeFalsy();
  });
  it('test deleteNodeByKey', () => {
    expect(findNodeByKey(processTree, '1-1')).toBeTruthy();
    expect(deleteNodeByKey('process', processTree, undefined, '1-1')).toEqual({
      type: 'process',
      key: '1-1',
      title: '测试流程一',
      data: {
        name: '11',
      },
    });
    expect(findNodeByKey(processTree, '1-1')).toBeFalsy();
    expect(findNodeByKey(processTree, '1-3')).toBeTruthy();
    expect(deleteNodeByKey('process', processTree, undefined, '1-3')).toBe(dir);
    expect(findNodeByKey(processTree, '1-3')).toBeFalsy();
  });
  it('test getUniqueId', () => {
    let uniqueId = getUniqueId(processTree);
    expect(findNodeByKey(processTree, uniqueId)).toBeFalsy();
    uniqueId = getUniqueId(processTree);
    expect(findNodeByKey(processTree, uniqueId)).toBeFalsy();
    uniqueId = getUniqueId(processTree);
    expect(findNodeByKey(processTree, uniqueId)).toBeFalsy();
    uniqueId = getUniqueId(processTree);
    expect(findNodeByKey(processTree, uniqueId)).toBeFalsy();
    uniqueId = getUniqueId(processTree);
    expect(findNodeByKey(processTree, uniqueId)).toBeFalsy();
    expect(uniqueId.indexOf('key_module_')).toBe(-1);
    uniqueId = getUniqueId(processTree, 'key_module_');
    expect(uniqueId.indexOf('key_module_')).not.toBe(-1);
  });
  it('test changeModifyState', () => {
    expect(
      changeModifyState(processTree, '1-1', true).hasModified
    ).toBeTruthy();
    expect(
      changeModifyState(processTree, '2-1', true).hasModified
    ).toBeTruthy();
    expect(
      changeModifyState(processTree, '2-1', false).hasModified
    ).toBeFalsy();
    expect(
      changeModifyState(processTree, '1-1', false).hasModified
    ).toBeFalsy();
  });
  it('test checkAndMakeDir deleteFolderRecursive', () => {
    checkAndMakeDir(__dirname + '/a/b');
    let result = fs.existsSync(__dirname + '/a/b');
    expect(result).toBeTruthy();
    deleteFolderRecursive(__dirname + '/a');
    result = fs.existsSync(__dirname + '/a/b');
    expect(result).toBeFalsy();
  });
  it('test newProject', done => {
    newProject('testNewProject', () => {
      expect(
        fs.existsSync(PATH_CONFIG('project', 'testNewProject'))
      ).toBeTruthy();
      expect(
        fs.existsSync(PATH_CONFIG('project', 'testNewProject/manifest.json'))
      ).toBeTruthy();
      expect(
        fs.existsSync(
          PATH_CONFIG('project', 'testNewProject/testNewProject_module')
        )
      ).toBeTruthy();
      expect(
        fs.existsSync(
          PATH_CONFIG(
            'project',
            'testNewProject/testNewProject_module/manifest.json'
          )
        )
      ).toBeTruthy();

      done();
    });
  });
  it('test persistentManifest', done => {
    newProject('testPersistent', () => {
      const beforeStat = fs.statSync(
        PATH_CONFIG('project', 'testPersistent/manifest.json')
      );
      persistentManifest(processTree, 'testPersistent', 'processTree', () => {
        const afterStat = fs.statSync(
          PATH_CONFIG('project', 'testPersistent/manifest.json')
        );
        expect(beforeStat.ctimeMs === afterStat.ctimeMs).toBeFalsy();
        done();
      });
    });
  });
  it('test persistentStorage', () => {
    const tree = persistentStorage([], processTree, 'testPersistent');
    expect(findNodeByKey(tree, '1-1')).toEqual({
      type: 'process',
      key: '1-1',
      title: '测试流程一',
      data: {},
    });
    expect(findNodeByKey(tree, '2-3')).toEqual({
      type: 'process',
      key: '2-3',
      title: '测试流程四',
      data: {},
    });
    // deleteFolderRecursive(PATH_CONFIG('project', 'testPersistent'));
  });
});

afterEach(() => {
  deleteFolderRecursive(PATH_CONFIG('project', 'testPersistent'));
  deleteFolderRecursive(PATH_CONFIG('project', 'testNewProject'));
});
