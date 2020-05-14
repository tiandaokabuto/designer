import React from 'react';
import Enzyme, { mount, shallow, render } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import ConditionParam from '../../../../../../app/containers/designerGraphBlock/layout/DragParamPanel/ParamPanel/ConditionParam';

Enzyme.configure({ adapter: new Adapter() });

function setup() {
  const handleEmitCodeTransform = jest.fn(() => {});
  const stopDeleteKeyDown = jest.fn(() => {});
  const cards = [];
  const param = { tag: 1, valueList: [], value: '', forceUpdate: 0 };

  const component = mount(
    <ConditionParam
      param={param}
      cards={cards}
      handleEmitCodeTransform={handleEmitCodeTransform}
      stopDeleteKeyDown={stopDeleteKeyDown}
    />
  );

  return {
    param,
    radios: component.find('.ant-radio-input'),
    component,
    addBtn: component.find('.add-btn'),
  };
}

describe('conditionParam', () => {
  it('test guide add', () => {
    const { radios, component, addBtn, param, btns } = setup();
    addBtn.at(0).simulate('click');
    expect(param.valueList.length).toBe(1);
    addBtn.at(0).simulate('click');
    expect(param.valueList.length).toBe(2);
    expect(param.valueList).toEqual([
      {
        id: 1,
        v1: '',
        v2: '',
        rule: '',
        connect: '',
      },
      {
        id: 2,
        v1: '',
        v2: '',
        rule: '',
        connect: '',
      },
    ]);
    component.unmount();
  });

  it('test guide delete', () => {
    const { radios, component, addBtn, param, btns } = setup();
    addBtn.at(0).simulate('click');
    addBtn.at(0).simulate('click');
    expect(param.valueList.length).toBe(2);
    const deleteBtn = component.find('.delete-btn');
    deleteBtn.at(0).simulate('click');
    deleteBtn.at(1).simulate('click');
    expect(param.valueList.length).toBe(0);
    component.unmount();
  });

  it('test customize', () => {
    const { radios, component, addBtn, param, btns } = setup();
    radios.at(1).simulate('change', {
      target: {
        value: 2,
      },
    });
    expect(param.tag).toBe(2);
    const input = component.find('.condition-param-customize-input');
    input.at(0).simulate('change', {
      target: {
        value: 'abcdefg',
      },
    });
    expect(param.value).toBe('abcdefg');
    component.unmount();
  });

  it('test guide input', () => {
    const { radios, component, addBtn, param, btns } = setup();
    addBtn.at(0).simulate('click');
    expect(param.valueList.length).toBe(1);
    expect(param.valueList).toEqual([
      {
        id: 1,
        v1: '',
        v2: '',
        rule: '',
        connect: '',
      },
    ]);
    const input = component.find('.condition-param-ifcondition .ant-input');
    input.at(0).simulate('change', {
      target: {
        value: 'v1input',
      },
    });
    input.at(1).simulate('change', {
      target: {
        value: 'v2input',
      },
    });
    expect(param.valueList).toEqual([
      {
        id: 1,
        v1: 'v1input',
        v2: 'v2input',
        rule: '',
        connect: '',
      },
    ]);
    component.unmount();
  });
});
