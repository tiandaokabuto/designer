import React, { useEffect, useState } from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import renderer from 'react-test-renderer';
import transformBreakStatement from '../../../../../app/containers/designerGraphBlock/RPAcore/graphBlockToCode/transformBreakStatement';
import transformConditionalStatement from '../../../../../app/containers/designerGraphBlock/RPAcore/graphBlockToCode/transformConditionalStatement';
import transformContinueStatement from '../../../../../app/containers/designerGraphBlock/RPAcore/graphBlockToCode/transformContinueStatement';
import transformCustomCodeStatement from '../../../../../app/containers/designerGraphBlock/RPAcore/graphBlockToCode/transformCustomCodeStatement';
import transformLoopStatement from '../../../../../app/containers/designerGraphBlock/RPAcore/graphBlockToCode/transformLoopStatement';
import transformPrintStatement from '../../../../../app/containers/designerGraphBlock/RPAcore/graphBlockToCode/transformPrintStatement';
import transformReturnStatement from '../../../../../app/containers/designerGraphBlock/RPAcore/graphBlockToCode/transformReturnStatement';
import transformSleepStatement from '../../../../../app/containers/designerGraphBlock/RPAcore/graphBlockToCode/transformSleepStatement';
import transformVariableDeclar from '../../../../../app/containers/designerGraphBlock/RPAcore/graphBlockToCode/transformVariableDeclar';

Enzyme.configure({ adapter: new Adapter() });

const paddingStart = (length) => '    '.repeat(length);

describe('test RPA', () => {
  it('test transformBreakStatement', () => {
    const Component = function ({ padding, dataStructure, result }) {
      return (
        <div>{transformBreakStatement(padding, dataStructure, result)}</div>
      );
    };

    const Rpa = (
      <div>
        <Component
          padding={paddingStart(2)}
          dataStructure={{}}
          result={{
            output: '',
          }}
        />
      </div>
    );

    expect(renderer.create(Rpa).toJSON()).toMatchSnapshot();
  });
  it('test transformContinueStatement', () => {
    const Component = function ({ padding, dataStructure, result }) {
      return (
        <div>{transformContinueStatement(padding, dataStructure, result)}</div>
      );
    };

    const Rpa = (
      <div>
        <Component
          padding={paddingStart(2)}
          dataStructure={{}}
          result={{
            output: '',
          }}
        />
      </div>
    );

    expect(renderer.create(Rpa).toJSON()).toMatchSnapshot();
  });
  it('test transformCustomCodeStatement', () => {
    const Component = function ({ padding, dataStructure, result }) {
      return (
        <div>
          {transformCustomCodeStatement(padding, dataStructure, result)}
        </div>
      );
    };

    const Rpa = (
      <div>
        <Component
          padding={paddingStart(2)}
          dataStructure={{
            codeValue: '这是一段测试的代码',
          }}
          result={{
            output: '',
          }}
        />
      </div>
    );

    expect(renderer.create(Rpa).toJSON()).toMatchSnapshot();
  });
  it('test transformConditionalStatement', () => {
    const Component = function ({ padding, dataStructure, result }) {
      return (
        <div>
          {transformConditionalStatement(padding, dataStructure, result)}
        </div>
      );
    };

    const Rpa = (
      <div>
        <Component
          padding={paddingStart(2)}
          dataStructure={{
            main: 'condition',
            $$typeof: 4,
            text: '条件分支',
            visibleTemplate: '如果满足{{ifcondition}} 则',
            pkg: 'Control',
            properties: {
              optional: [],
              required: [
                {
                  componentType: 0,
                  default: '',
                  cnName: '条件',
                  valueList: [
                    { v1: 'name', v2: '2', rule: '!=', connect: 'and' },
                    { v1: 'sd', v2: 'er', rule: '>', connect: '' },
                  ],
                  enName: 'ifcondition',
                  valueMapping: [
                    { name: '等于', value: '==' },
                    { name: '不等于', value: '!=' },
                    { name: '大于', value: '>' },
                    { name: '小于', value: '<' },
                    { name: '大于等于', value: '>=' },
                    { name: '小于等于', value: '<=' },
                    { name: '空', value: 'is None' },
                    { name: '非空', value: 'not None' },
                  ],
                  tag: 1,
                  value: '',
                  key: '7',
                  desc: '',
                  forceUpdate: 15,
                  _forceUpdate: 15,
                },
              ],
            },
            ifChildren: [],
            elseChildren: [],
            id: 'node_2',
          }}
          result={{
            output: '',
          }}
        />
      </div>
    );

    expect(renderer.create(Rpa).toJSON()).toMatchSnapshot();
  });
  it('test transformLoopStatement', () => {
    const Component = function ({ padding, dataStructure, result }) {
      return (
        <div>{transformLoopStatement(padding, dataStructure, result)}</div>
      );
    };

    const Rpa = (
      <div>
        <Component
          padding={paddingStart(2)}
          dataStructure={{
            main: 'loop',
            $$typeof: 2,
            text: '循环控制',
            visibleTemplate: '循环: 当满足{{loopcondition}} 时',
            pkg: 'Control',
            properties: {
              optional: [],
              required: [
                {
                  componentType: 1,
                  default: '',
                  cnName: '循环类型',
                  enName: 'looptype',
                  valueMapping: [
                    { name: '遍历数组', value: 'for_list' },
                    { name: '遍历字典', value: 'for_dict' },
                    { name: '计次循环', value: 'for_times' },
                    { name: '条件循环', value: 'for_condition' },
                  ],
                  value: 'for_list',
                  _value: 'for_list',
                },
                {
                  componentType: 0,
                  default: '',
                  cnName: '循环条件',
                  valueList: [],
                  enName: 'loopcondition',
                  valueMapping: [
                    { name: '等于', value: '==' },
                    { name: '不等于', value: '!=' },
                    { name: '大于', value: '>' },
                    { name: '小于', value: '<' },
                    { name: '大于等于', value: '>=' },
                    { name: '小于等于', value: '<=' },
                    { name: '空', value: 'is None' },
                    { name: '非空', value: 'not None' },
                  ],
                  tag: 1,
                  value: '',
                  desc: '',
                  forceUpdate: 12,
                  _forceUpdate: 12,
                  for_list: [
                    {
                      id: 'listKeyword',
                      enName: 'value',
                      cnName: '值',
                      value: 'item',
                      paramType: ['String'],
                    },
                    {
                      id: 'listArray',
                      enName: 'arrayRet',
                      cnName: '数组',
                      value: '[1,2,3]',
                      paramType: ['List'],
                    },
                  ],
                  for_dict: [
                    {
                      id: 'dictKey',
                      enName: 'key',
                      cnName: '键',
                      value: '',
                      paramType: ['String'],
                    },
                    {
                      id: 'dictValue',
                      enName: 'value',
                      cnName: '值',
                      value: '',
                      paramType: ['String'],
                    },
                    {
                      id: 'dictVar',
                      enName: 'dictVar',
                      cnName: '字典',
                      value: '',
                      paramType: ['Dictionary'],
                    },
                  ],
                  for_times: [
                    {
                      id: 'timeIndex',
                      enName: 'index',
                      cnName: '索引名称',
                      value: '',
                      paramType: ['String'],
                    },
                    {
                      id: 'timeStartIndex',
                      enName: 'startIndex',
                      cnName: '初始值',
                      value: '',
                      paramType: ['String'],
                    },
                    {
                      id: 'timeEndIndex',
                      enName: 'endIndex',
                      cnName: '结束值',
                      value: '',
                      paramType: ['String'],
                    },
                    {
                      id: 'timeStep',
                      enName: 'step',
                      cnName: '每次增加',
                      value: '',
                      paramType: ['String'],
                    },
                  ],
                },
              ],
            },
            children: [],
            id: 'node_3',
          }}
          result={{
            output: '',
          }}
        />
      </div>
    );

    expect(renderer.create(Rpa).toJSON()).toMatchSnapshot();
  });
  it('test transformPrintStatement', () => {
    const Component = function ({ padding, dataStructure, result }) {
      const [output, moduleMap] = transformPrintStatement(
        padding,
        dataStructure,
        result,
        new Map()
      );
      console.log(moduleMap, 'moduleMap');
      return (
        <div>
          {output} - {moduleMap.get('sendiRPA.logHandler')}
        </div>
      );
    };

    const Rpa = (
      <div>
        <Component
          padding={paddingStart(2)}
          dataStructure={{
            visible: '',
            subtype: 8,
            main: 'print',
            $$typeof: 1,
            text: '控制台打印',
            pkg: 'Control',
            properties: {
              optional: [
                {
                  paramType: 0,
                  componentType: 1,
                  default: 'format',
                  cnName: '替换类型',
                  enName: 'replaceType',
                  valueMapping: [
                    { name: 'format', value: 'format' },
                    { name: 'format_map', value: 'format_map' },
                  ],
                  value: '',
                  desc: '选择打印输出的替换类型',
                },
                {
                  paramType: 0,
                  componentType: 0,
                  default: '',
                  cnName: '传参',
                  enName: 'params',
                  valueMapping: [],
                  value: '3',
                  desc: 'format函数的入参',
                },
              ],
              required: [
                {
                  componentType: 0,
                  default: '',
                  cnName: '模版字符串',
                  enName: 'template_string',
                  value: '"name-{}"',
                },
                {
                  paramType: 0,
                  componentType: 1,
                  default: '',
                  cnName: '日志等级',
                  enName: 'logLevel',
                  valueMapping: [
                    { name: 'INFO', value: 'info' },
                    { name: 'WARNING', value: 'warning' },
                    { name: 'ERROR', value: 'error' },
                    { name: 'DEBUG', value: 'debug' },
                  ],
                  value: 'warning',
                  desc: '选择打印输出日志等级',
                },
              ],
            },
            id: 'node_23',
            userDesc: '',
            _userDesc: '',
          }}
          result={{
            output: '',
          }}
        />
      </div>
    );
    // expect(map.has('sendiRPA.logHandler')).toBeTruthy();
    expect(renderer.create(Rpa).toJSON()).toMatchSnapshot();
  });
  it('test transformReturnStatement', () => {
    const Component = function ({ padding, dataStructure, result, blockNode }) {
      return (
        <div>
          {transformReturnStatement(padding, dataStructure, result, blockNode)}
        </div>
      );
    };

    const Rpa = (
      <div>
        <Component
          padding={paddingStart(2)}
          dataStructure={{
            visible: '',
            subtype: 16,
            main: 'return',
            $$typeof: 1,
            text: '流程块返回',
            pkg: 'Control',
            properties: {
              optional: [],
              required: [
                {
                  componentType: 0,
                  default: '',
                  cnName: '返回值表达式',
                  enName: 'return_string',
                  value: [{ name: 'name', value: '哈哈哈' }],
                },
              ],
            },
            id: 'node_12',
            userDesc: '',
            _userDesc: '',
          }}
          result={{
            output: '',
          }}
          blockNode={{
            shape: 'processblock',
            properties: [
              {
                cnName: '标签名称',
                enName: 'label',
                value: '流程块',
                default: '',
              },
              { cnName: '输入参数', enName: 'param', value: [], default: '' },
              {
                cnName: '流程块返回',
                enName: 'output',
                value: [{ name: 'name', value: '哈哈哈' }],
                default: '',
              },
            ],
            variable: [],
            cards: [
              {
                visible: '',
                subtype: 16,
                main: 'return',
                $$typeof: 1,
                text: '流程块返回',
                pkg: 'Control',
                properties: {
                  optional: [],
                  required: [
                    {
                      componentType: 0,
                      default: '',
                      cnName: '返回值表达式',
                      enName: 'return_string',
                      value: [{ name: 'name', value: '哈哈哈' }],
                    },
                  ],
                },
                id: 'node_12',
                userDesc: '',
                _userDesc: '',
              },
            ],
            pythonCode: 'pass\n',
          }}
        />
      </div>
    );

    expect(renderer.create(Rpa).toJSON()).toMatchSnapshot();
  });
  it('test transformSleepStatement', () => {
    const Component = function ({ padding, dataStructure, result }) {
      const [output, moduleMap] = transformSleepStatement(
        padding,
        dataStructure,
        result,
        new Map()
      );
      return (
        <div>
          {output} - {moduleMap.get('time')}
        </div>
      );
    };

    const Rpa = (
      <div>
        <Component
          padding={paddingStart(2)}
          dataStructure={{
            visible: '',
            subtype: 128,
            module: 'time',
            main: 'sleep',
            $$typeof: 1,
            text: '延迟',
            pkg: 'sleep',
            properties: {
              optional: [],
              required: [
                {
                  paramType: 1,
                  componentType: 0,
                  default: '',
                  cnName: '延迟时间',
                  enName: 'delay',
                  value: '2',
                },
              ],
            },
            id: 'node_1',
            userDesc: '',
            _userDesc: '',
          }}
          result={{
            output: '',
          }}
        />
      </div>
    );
    expect(renderer.create(Rpa).toJSON()).toMatchSnapshot();
  });
  it('test transformVariableDeclar', () => {
    const Component = function ({ padding, dataStructure, result }) {
      return (
        <div>{transformVariableDeclar(padding, dataStructure, result)}</div>
      );
    };

    const Rpa = (
      <div>
        <Component
          padding={paddingStart(2)}
          dataStructure={{
            subtype: 3,
            main: 'vardefine',
            $$typeof: 1,
            text: '变量赋值',
            visibleTemplate: '变量名称{{newVar}} 赋值为 {{init}}',
            pkg: 'Control',
            properties: {
              optional: [],
              required: [
                {
                  componentType: 0,
                  default: '',
                  cnName: '变量名称',
                  enName: 'newVar',
                  value: '新变量1',
                  _value: '新变量1',
                },
                {
                  componentType: 0,
                  default: '',
                  cnName: '变量值',
                  enName: 'init',
                  value: '2323',
                  _value: '2323',
                },
              ],
            },
            id: 'node_1',
            userDesc: '',
            _userDesc: '',
          }}
          result={{
            output: '',
          }}
        />
      </div>
    );

    expect(renderer.create(Rpa).toJSON()).toMatchSnapshot();
  });
});
