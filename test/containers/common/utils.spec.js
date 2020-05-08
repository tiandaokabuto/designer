import {
  isDirNode,
  findNodeByKey,
  hasDuplicateKey,
  deleteNodeByKey,
  getUniqueId,
  changeModifyState,
} from '../../../app/containers/common/utils';
import uniqueId from 'lodash/uniqueId';

let processTree = null;
let dir = null;
let process = null;
beforeEach(() => {
  process = {
    type: 'process',
    key: '2-1',
    title: '测试流程三',
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
      },
    ],
  };
  processTree = [
    {
      type: 'process',
      key: '1-1',
      title: '测试流程一',
    },
    {
      type: 'process',
      key: '1-2',
      title: '测试流程二',
    },
    dir,
    {
      type: 'process',
      key: '1-4',
      title: '测试流程五',
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
    });
    expect(findNodeByKey(processTree, '2-3')).toEqual({
      type: 'process',
      key: '2-3',
      title: '测试流程四',
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
    });
    expect(findNodeByKey(processTree, '1-1')).toBeFalsy();
    expect(findNodeByKey(processTree, '1-3')).toBeTruthy();
    expect(deleteNodeByKey('process', processTree, undefined, '1-3')).toBe(dir);
    expect(findNodeByKey(processTree, '1-3')).toBeFalsy();
  });
  it('test getUniqueId', () => {
    let uinqueId = getUniqueId(processTree);
    expect(findNodeByKey(processTree, uniqueId)).toBeFalsy();
    uinqueId = getUniqueId(processTree);
    expect(findNodeByKey(processTree, uniqueId)).toBeFalsy();
    uinqueId = getUniqueId(processTree);
    expect(findNodeByKey(processTree, uniqueId)).toBeFalsy();
    uinqueId = getUniqueId(processTree);
    expect(findNodeByKey(processTree, uniqueId)).toBeFalsy();
    uinqueId = getUniqueId(processTree);
    expect(findNodeByKey(processTree, uniqueId)).toBeFalsy();
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
});
