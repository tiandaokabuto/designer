import React from 'react';
import Enzyme, { mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import store from '../../app/store';
import VariablePanel from '../../app/containers/designerGraphEdit/layout/GraphParamPanel/components/VariablePanel';

Enzyme.configure({ adapter: new Adapter() });

function setup(disabled = false) {
  const blockNode = { variable: [] };
  const handleEmitCodeTransform = jest.fn(() => {});
  const component = mount(
    <Provider store={store}>
      <VariablePanel
        blockNode={blockNode}
        disabled={disabled}
        handleEmitCodeTransform={handleEmitCodeTransform}
      />
    </Provider>
  );
  return {
    blockNode,
    component,
    handleEmitCodeTransform,
    buttons: component.find('.variablePanel-btn'),
    input: component.find('input'),
  };
}

describe('varibalePanel', () => {
  it('test buttons', () => {
    const { blockNode, buttons, component } = setup();
    buttons.at(0).simulate('click');
    expect(blockNode.variable.length).toBe(1);
    buttons.at(0).simulate('click');
    expect(blockNode.variable.length).toBe(2);
    expect(blockNode.variable).toEqual([
      { name: '', value: '' },
      { name: '', value: '' },
    ]);
    component.find('.variablePanel-btn__delete').at(0).simulate('click');
    expect(blockNode.variable.length).toBe(1);
  });

  it('test disabled', () => {
    const { blockNode, buttons, component } = setup(true);
    expect(buttons.length).toBe(0);
  });

  it('test handleEmitCodeTransform', () => {
    const { blockNode, buttons, component, handleEmitCodeTransform } = setup();
    buttons.at(0).simulate('click');
    const input = component.find('input');
    expect(input.length).toBe(2);
    input.at(0).simulate('change', {
      target: {
        value: '123',
      },
    });
    expect(handleEmitCodeTransform.mock.calls.length).toBe(1);
  });
});
