import {
  findNodeLevelById,
  findIFNodeLevelById,
  insertAfter,
  isChildrenNode,
  findNodeById,
} from '../../../../../app/containers/designerGraphBlock/shared/utils';

let cards = null;

beforeEach(() => {
  cards = [
    {
      outPut: 'hWeb',
      outPutDesc: '成功返回浏览器对象,失败返回None',
      cmdDesc: '启动一个新的Chrome浏览器窗口，启动后可以对这个浏览器进行操作',
      visible: '打开浏览器',
      module: 'sendiRPA',
      cmdName: '打开浏览器',
      main: 'openBrowser',
      $$typeof: 1,
      text: '打开浏览器',
      visibleTemplate: '打开浏览器,并返回对象到{{outPut}}',
      pkg: 'Browser',
      id: 'node_43',
      userDesc: '',
      _userDesc: '',
      hasModified: false,
    },
    {
      outPut: 'suc',
      outPutDesc: '成功返回True,失败返回False',
      cmdDesc: '关闭浏览器窗口',
      visible: '关闭浏览器',
      module: 'sendiRPA',
      cmdName: '关闭浏览器',
      main: 'closeBrowser',
      $$typeof: 1,
      text: '关闭浏览器',
      visibleTemplate: '关闭浏览器{{_browser}}',
      pkg: 'Browser',
      id: 'node_67',
      userDesc: '',
      _userDesc: '',
      hasModified: false,
    },
    {
      main: 'loop',
      $$typeof: 2,
      text: '循环控制',
      visibleTemplate: '循环: 当满足{{loopcondition}} 时',
      pkg: 'Control',
      children: [
        {
          visible: '',
          subtype: 8,
          main: 'print',
          $$typeof: 1,
          text: '控制台打印',
          pkg: 'Control',

          id: 'node_126',
          userDesc: '',
          _userDesc: '',
          hasModified: false,
        },
        {
          main: 'loop',
          $$typeof: 2,
          text: '循环控制',
          visibleTemplate: '循环: 当满足{{loopcondition}} 时',
          pkg: 'Control',
          children: [
            {
              visible: '',
              subtype: 8,
              main: 'print',
              $$typeof: 1,
              text: '控制台打印',
              pkg: 'Control',
              id: 'node_124',
              userDesc: '',
              _userDesc: '',
              hasModified: false,
            },
          ],
          id: 'node_96',
        },
      ],
      id: 'node_95',
    },
    {
      main: 'condition',
      $$typeof: 2,
      text: '循环控制',
      visibleTemplate: '循环: 当满足{{loopcondition}} 时',
      pkg: 'Control',
      ifChildren: [
        {
          visible: '',
          subtype: 8,
          main: 'print',
          $$typeof: 1,
          text: '控制台打印',
          pkg: 'Control',
          id: 'node_125',
          userDesc: '',
          _userDesc: '',
          hasModified: false,
        },
      ],
      elseChildren: [
        {
          outPut: 'suc',
          outPutDesc: '成功返回True,失败返回False',
          cmdDesc: '关闭浏览器窗口',
          visible: '关闭浏览器',
          module: 'sendiRPA',
          cmdName: '关闭浏览器',
          main: 'closeBrowser',
          $$typeof: 1,
          text: '关闭浏览器',
          visibleTemplate: '关闭浏览器{{_browser}}',
          pkg: 'Browser',
          id: 'node_98',
          userDesc: '',
          _userDesc: '',
          hasModified: false,
        },
      ],
      id: 'node_97',
    },
  ];
});

describe('test share/utils', () => {
  it('test findNodeLevelById', () => {
    let result = findNodeLevelById(cards, 'node_67');
    expect(result).toBe(cards);
    result = findNodeLevelById(cards, 'node_124');
    expect(result).toEqual([
      {
        visible: '',
        subtype: 8,
        main: 'print',
        $$typeof: 1,
        text: '控制台打印',
        pkg: 'Control',
        id: 'node_124',
        userDesc: '',
        _userDesc: '',
        hasModified: false,
      },
    ]);
    result = findNodeLevelById(cards, 'node_98');
    expect(result).toEqual([
      {
        outPut: 'suc',
        outPutDesc: '成功返回True,失败返回False',
        cmdDesc: '关闭浏览器窗口',
        visible: '关闭浏览器',
        module: 'sendiRPA',
        cmdName: '关闭浏览器',
        main: 'closeBrowser',
        $$typeof: 1,
        text: '关闭浏览器',
        visibleTemplate: '关闭浏览器{{_browser}}',
        pkg: 'Browser',
        id: 'node_98',
        userDesc: '',
        _userDesc: '',
        hasModified: false,
      },
    ]);
    result = findNodeLevelById(cards, 'node_125');
    expect(result).toEqual([
      {
        visible: '',
        subtype: 8,
        main: 'print',
        $$typeof: 1,
        text: '控制台打印',
        pkg: 'Control',
        id: 'node_125',
        userDesc: '',
        _userDesc: '',
        hasModified: false,
      },
    ]);
  });
  it('test findIFNodeLevelById', () => {
    let result = findIFNodeLevelById(cards, 'node_97', 'ifChildren');
    expect(result).toEqual([
      {
        visible: '',
        subtype: 8,
        main: 'print',
        $$typeof: 1,
        text: '控制台打印',
        pkg: 'Control',
        id: 'node_125',
        userDesc: '',
        _userDesc: '',
        hasModified: false,
      },
    ]);
    result = findIFNodeLevelById(cards, 'node_97', 'elseChildren');
    expect(result).toEqual([
      {
        outPut: 'suc',
        outPutDesc: '成功返回True,失败返回False',
        cmdDesc: '关闭浏览器窗口',
        visible: '关闭浏览器',
        module: 'sendiRPA',
        cmdName: '关闭浏览器',
        main: 'closeBrowser',
        $$typeof: 1,
        text: '关闭浏览器',
        visibleTemplate: '关闭浏览器{{_browser}}',
        pkg: 'Browser',
        id: 'node_98',
        userDesc: '',
        _userDesc: '',
        hasModified: false,
      },
    ]);
  });
  it('test insertAfter', () => {
    let append = { test: 'szxzyljzdc', id: 'test' };
    let result = insertAfter(cards, 'node_67', [append]);
    expect(result).toBe(true);
    expect(cards.length).toBe(5);
    result = findNodeLevelById(cards, 'test');
    expect(result[2]).toBe(append);
  });
  it('test isChildrenNode', () => {
    let parent = findNodeById(cards, 'node_95');
    let child = findNodeById(cards, 'node_126');
    expect(isChildrenNode(parent, child)).not.toBe(false);
  });
});
