import React from 'react';
import Enzyme, { mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import store from '../../app/store';
import ConditionParam from '../../../../../../app/containers/designerGraphBlock/layout/DragParamPanel/components/ConditionParam';

Enzyme.configure({ adapter: new Adapter() });

function setup(keyFlag = 'key') {
  const handleEmitCodeTransform = jest.fn(() => {});
  const stopDeleteKeyDown = jest.fn(() => {});
  const setFlag = jest.fn(() => {});
  const cards = [];
  const param = { tag: 1, valueList: [], value: '', forceUpdate: 0 };

  const component = mount();
}
