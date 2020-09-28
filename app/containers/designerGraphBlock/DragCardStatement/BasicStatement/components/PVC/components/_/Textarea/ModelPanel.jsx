import React, { useState, useEffect } from 'react';
import { Input, Divider } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import '../public.less';

const TextareaComponent = props => {
    let { item, handleSelect, focusItemId, handleDeleteComponent } = props;

    // const handleSelect = () => {
    //     console.log('props.item', item);
    // };
    return (
        <div
            className={`component-contain ${focusItemId === item.id ? 'item-selected' : ''}`}
            style={{ width: item.width, padding: '0px 12px' }}
            onClick={handleSelect}
        >
            <div>
                {item.title}
                <span
                    style={{
                        display: item.required ? '' : 'none',
                        color: 'red',
                        marginLeft: '2px',
                    }}
                >
                    *
                </span>
            </div>

            <Input.TextArea placeholder="请输入内容" value={item.value} type="text" />
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
TextareaComponent.propTypes = {};

export default TextareaComponent;
