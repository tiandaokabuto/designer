import React from 'react';
import { Select, Divider } from 'antd';
import {
  DeleteOutlined,
  UnorderedListOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import './select.less';

const { Option } = Select;

const SelectComponent = props => {
  let {
    width,
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
    <div style={{ flexBasis: width }} className="panel-content-row-col">
      <div
        className={`pvc-select component-contain ${
          focusItemId === item.id ? 'item-selected' : ''
        }`}
        onClick={() => setFocusItemId(item.id)}
      >
        <div
          className="pvc-input-label"
          style={{
            display: item.attribute.label ? 'block' : 'none',
          }}
        >
          <UnorderedListOutlined /> {item.attribute.label}
        </div>

        <div
          className="pvc-input-desc"
          style={{
            display: item.attribute.desc ? 'block' : 'none',
          }}
        >
          {item.attribute.desc}
        </div>

        <Select
          size="small"
          style={{ width: '100%' }}
          placeholder={item.attribute.desc}
          value={item.attribute.value}
          onChange={onChange}
          onFocus={onFocus}
        >
          {/* 
            <Option value="tom">Tom</Option>;
            {item.attribute.dataSource
            ? item.attribute.dataSource.map((Subitem, index) => {
                return <Option value="tom">Tom</Option>;
              })
            : ""} */}
        </Select>
        <div
          className="move-component-btn-up"
          style={{ display: focusItemId === item.id ? 'block' : 'none' }}
          onClick={() => {
            item.float = 'left';
            moveUp(focusItemId);
          }}
        >
          <ArrowUpOutlined />
        </div>
        <div
          className="move-component-btn-down"
          style={{ display: focusItemId === item.id ? 'block' : 'none' }}
          onClick={() => {
            item.float = 'left';
            moveDown(focusItemId);
          }}
        >
          <ArrowDownOutlined />
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
      </div>
    </div>
  );
};
SelectComponent.propTypes = {};

export default SelectComponent;
