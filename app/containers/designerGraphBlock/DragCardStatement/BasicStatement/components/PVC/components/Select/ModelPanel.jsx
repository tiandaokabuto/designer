import React from 'react';
import { Select, Divider } from 'antd';
import {
  DeleteOutlined,
  VerticalAlignTopOutlined,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons';
import '../public.less';

const { Option } = Select;

const SelectComponent = props => {
  let {
    item,
    setDataList,
    handleDeleteComponent,
    focusItemId,
    setFocusItemId,
    moveUp,
    moveDown,
  } = props;

  const onChange = value => {
    console.log(`selected ${value}`);
  };
  const onBlur = value => {
    console.log('blur');
  };

  const onFocus = () => {
    console.log('focus');
  };

  const onSearch = val => {
    console.log('search:', val);
  };

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
        <Select
          size="small"
          style={{ width: '100%' }}
          placeholder={item.attribute.desc}
          value={item.attribute.value}
          onChange={onChange}
          onFocus={onFocus}
        >
          <Option value="tom">Tom</Option>;
          {/* {item.attribute.dataSource
            ? item.attribute.dataSource.map((Subitem, index) => {
                return <Option value="tom">Tom</Option>;
              })
            : ""} */}
        </Select>
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
SelectComponent.propTypes = {};

export default SelectComponent;
