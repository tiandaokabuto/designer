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
  // it('test transformLoopStatement', () => {});
  it('test transformPrintStatement', () => {
    const map = new Map();
    const Component = function ({ padding, dataStructure, result }) {
      const [output, moduleT] = transformPrintStatement(
        padding,
        dataStructure,
        result,
        map
      );
      return (
        <div>
          {output} - {moduleT}
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
});
