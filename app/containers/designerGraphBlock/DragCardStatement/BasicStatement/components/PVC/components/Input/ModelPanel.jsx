import React, { useState, useEffect } from 'react';
import { Input, Divider } from 'antd';
import {
    DeleteOutlined,
    VerticalAlignTopOutlined,
    VerticalAlignBottomOutlined,
} from '@ant-design/icons';
import '../public.less';
import './input.less'

const InputComponent = ({
    item,
    setDataList,
    handleDeleteComponent,
    focusItemId,
    setFocusItemId,
    moveUp,
    moveDown,
}) => {
    return (
        <div style={{ flexBasis: `${item.attribute.width}%` }} className="panel-content-row-col">
            <div
                // style={{ flexBasis: `${item.width}%` }}
                className={`pvc-input component-contain ${focusItemId === item.id ? 'item-selected' : ''}`}
                onClick={() => setFocusItemId(item.id)}
            >
                <div className='pvc-input-label'>
                    {item.attribute.label}
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
                <div
                    style={{
                        display: item.attribute.desc ? 'block' : 'none',
                        color: '#666',
                    }}
                >
                    提示：{item.attribute.desc}
                </div>

                <Input placeholder="请输入内容" value={item.attribute.value} disabled type="text" />

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
InputComponent.propTypes = {};

export default InputComponent;
