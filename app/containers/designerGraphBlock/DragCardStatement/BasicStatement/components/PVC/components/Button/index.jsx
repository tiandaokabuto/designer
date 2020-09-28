import React from 'react';
import { Button } from 'antd';
import {
  DeleteOutlined,
  VerticalAlignBottomOutlined,
  VerticalAlignTopOutlined,
} from '@ant-design/icons';
import '../public.less';
import { CANCEL_COMPONENT } from '../componentTypes';

const SubmitButtonComponent = props => {
  let {
    item,
    setDataList,
    handleDeleteComponent,
    focusItemId,
    setFocusItemId,
    moveUp,
    moveDown,
  } = props;
  let buttonValue = '提交';
  let buttonType = 'primary';

  if (item.type === CANCEL_COMPONENT) {
    buttonValue = '取消';
    buttonType = 'danger';
  }

  return (
    <div
      style={{ flexBasis: `${item.attribute.width}%` }}
      className="panel-content-row-col"
    >
      <div
        className={`component-contain ${
          focusItemId === item.id ? 'item-selected' : ''
        }`}
        onClick={() => setFocusItemId(item.id)}
      >
        <div>{item.attribute.label}</div>
        <div style={{ textAlign: 'center' }}>
          <Button type={buttonType}>{buttonValue}</Button>
        </div>

        <div
          className="delete-component-btn "
          style={{
            display: focusItemId === item.id ? 'block' : 'none',
          }}
          onClick={e => {
            e.stopPropagation();
            handleDeleteComponent(item.id);
          }}
        >
          <DeleteOutlined />
        </div>
        <div
          className="move-component-btn"
          style={{
            position: 'absolute',
            top: 0,
            right: 24,
            display: focusItemId === item.id ? 'block' : 'none',
          }}
          onClick={() => {
            item.float = 'left';
            moveUp(focusItemId);
          }}
        >
          <VerticalAlignTopOutlined />
        </div>
        <div
          className="move-component-btn"
          style={{
            position: 'absolute',
            top: 0,
            right: 48,
            display: focusItemId === item.id ? 'block' : 'none',
          }}
          onClick={() => {
            item.float = 'left';
            moveDown(focusItemId);
          }}
        >
          <VerticalAlignBottomOutlined />
        </div>
      </div>
    </div>
  );
};
export default SubmitButtonComponent;
