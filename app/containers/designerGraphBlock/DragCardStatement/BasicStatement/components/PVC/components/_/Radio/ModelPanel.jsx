import React from 'react';
import { Radio, Divider } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

const RadioComponent = props => {
    let { item, handleSelect, focusItemId, handleDeleteComponent } = props;

    return (
        <div
            className={`component-contain ${focusItemId === item.id ? 'item-selected' : ''}`}
            style={{
                width: item.width,
            }}
            onClick={handleSelect}
        >
            <div>单项选择</div>
            {item.item
                ? item.item.map(item => {
                      return (
                          <div
                              onClick={handleSelect}
                              style={{ display: 'inline-block', width: '20%', margin: '1%' }}
                          >
                              <Radio>{item.name}</Radio>
                          </div>
                      );
                  })
                : ''}
            <div
                className="delete-component-btn"
                style={{
                    display: focusItemId === item.id ? 'block' : 'none',
                }}
                onClick={handleDeleteComponent}
            >
                <DeleteOutlined />
            </div>
        </div>
    );
};
RadioComponent.propTypes = {};

export default RadioComponent;
