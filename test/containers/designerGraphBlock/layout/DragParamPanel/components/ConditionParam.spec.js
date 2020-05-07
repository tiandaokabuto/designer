import React, { useState } from 'react';
import Enzyme, { mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
// import store from '../../../../../../app/store';
import ConditionParam from '../../../../../../app/containers/designerGraphBlock/layout/DragParamPanel/ParamPanel/ConditionParam';

Enzyme.configure({ adapter: new Adapter() });

function setup(keyFlag = false) {
  const handleEmitCodeTransform = jest.fn(() => {});
  const stopDeleteKeyDown = jest.fn(() => {});
  const setFlag = jest.fn(() => {});
  const cards = [];
  const param = { tag: 1, valueList: [], value: '', forceUpdate: 0 };

  const component = mount(
    <ConditionParam
      param={param}
      cards={cards}
      setFlag={setFlag}
      keyFlag={keyFlag}
      handleEmitCodeTransform={handleEmitCodeTransform}
      stopDeleteKeyDown={stopDeleteKeyDown}
    ></ConditionParam>
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
        v1: '',
        v2: '',
        rule: '',
        connect: '',
      },
      {
        v1: '',
        v2: '',
        rule: '',
        connect: '',
      },
    ]);
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
    // expect(input.length).toBe(3);
    // console.log(input.get(0));
    // console.log(input.get(1));
    // console.log(input.get(2));
  });

  it('test guide input', () => {
    const { radios, component, addBtn, param, btns } = setup();
    addBtn.at(0).simulate('click');
    expect(param.valueList.length).toBe(1);
    expect(param.valueList).toEqual([
      {
        v1: '',
        v2: '',
        rule: '',
        connect: '',
      },
    ]);
    const input = component.find('.ant-input');
    console.log(input.length);
  });
});
