import React from 'react';
import Enzyme, { mount, shallow, render } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import store from '../../../../../../app/store';
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
  it('test buttons', () => {
    const { radios, component, addBtn, param } = setup();

    // radios.at(1).simulate('change', {
    //   target: {
    //     value: 2,
    //   },
    // });
    // expect(param.tag).toBe(2);
    addBtn.at(0).simulate('click');
    expect(param.valueList.length).toBe(1);

    const deleteButton = component.find('.condition-param-ifcondition');

    expect(deleteButton.length).toBe(2);
  });
});
