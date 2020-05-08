import React from 'react';
import Enzyme, { mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import MockCounter from './Counter';

Enzyme.configure({ adapter: new Adapter() });

jest.mock('./Counter', () => {
  return function () {
    return 'hhh';
  };
});

describe('test', () => {
  it('test --1', () => {
    const Component = mount(
      <div className="container">
        <MockCounter />
      </div>
    );
    expect(Component.find('.container').text()).toBe('hhh');
  });
});
