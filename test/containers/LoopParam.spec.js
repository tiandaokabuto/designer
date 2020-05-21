import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import LoopPanelParam from '../../app/containers/designerGraphBlock/layout/DragParamPanel/ParamPanel/LoopPanelParam';

Enzyme.configure({ adapter: new Adapter() });
const setFlag = jest.fn(() => {});

const for_list = [
  {
    id: 'listKeyword',
    enName: 'value',
    cnName: '值',
    value: '',
    paramType: ['String'],
  },
  {
    id: 'listArray',
    enName: 'arrayRet',
    cnName: '数组',
    value: '',
    paramType: ['List'],
  },
];

const for_dict = [
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
];

const for_times = [
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
];
const aiHintList = {
  String: [
    {
      value: 'stringA',
    },
    {
      value: 'stringB',
    },
  ],
  List: [{ value: 'listA' }],
  Dictionary: [{ value: 'dictionaryA' }],
};
describe('循环组件', () => {
  it('循环渲染的input数目是否正确', () => {
    const wrapper = mount(
      <LoopPanelParam param={{ for_list }} keyFlag={false} setFlag={setFlag} />
    );
    expect(wrapper.find('div.param-item')).toHaveLength(2);
    wrapper.setProps({
      loopSelect: 'for_dict',
      param: { for_dict },
    });
    expect(wrapper.find('div.param-item')).toHaveLength(3);
    wrapper.setProps({
      loopSelect: 'for_times',
      param: { for_times },
    });
    expect(wrapper.find('div.param-item')).toHaveLength(4);
    wrapper.unmount();
  });
});
