import React, { useState, useEffect } from 'react';
import { DatePicker, Divider } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import '../public.less';
const { RangePicker } = DatePicker;

const DateComponent = props => {
    let { item, handleSelect, focusItemId, handleDeleteComponent } = props;
    const onDateRangeChange = () => {
        console.log('onDateRangeChange');
    };

    return (
        <div
            className={`component-contain ${focusItemId === item.id ? 'item-selected' : ''}`}
            style={{ width: item.width }}
            onClick={handleSelect}
        >
            <div className="component-title">日期选择</div>
            <RangePicker style={{ width: '100%', height: '40px' }} onChange={onDateRangeChange} />
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
DateComponent.propTypes = {};

export default DateComponent;
