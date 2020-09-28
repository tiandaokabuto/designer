import React, { useState, useEffect } from 'react';
import { Table, Tag, Divider } from 'antd';
import { PlusSquareOutlined, DeleteOutlined } from '@ant-design/icons';
import '../public.less';

const TableComponent = props => {
    let { item, handleSelect, focusItemId, handleDeleteComponent } = props;

    const columns = [
        {
            title: '单行文字',
            dataIndex: 'name',
            key: 'name',
            render: text => <a>{text}</a>,
        },
        {
            title: '单行文字',
            dataIndex: 'age',
            key: 'age',
        },
        {
            title: '单行文字',
            dataIndex: 'address',
            key: 'address',
        },
        {
            title: 'Tags',
            key: 'tags',
            dataIndex: 'tags',
            render: tags => (
                <>
                    {tags.map(tag => {
                        let color = tag.length > 5 ? 'geekblue' : 'green';
                        if (tag === 'loser') {
                            color = 'volcano';
                        }
                        return (
                            <Tag color={color} key={tag}>
                                {tag.toUpperCase()}
                            </Tag>
                        );
                    })}
                </>
            ),
        },
    ];

    const data = [
        {
            key: '1',
            name: '请输入内容',
            age: 1,
            address: 'N',
            tags: ['内容', '内容'],
        },
        {
            key: '2',
            name: '请输入内容',
            age: 2,
            address: '请输入内容',
            tags: ['内容'],
        },
    ];

    return (
        <div
            className={`component-contain ${focusItemId === item.id ? 'item-selected' : ''}`}
            style={{ width: item.width, padding: '0px 12px' }}
            onClick={handleSelect}
        >
            <div className="component-title">表格</div>
            <Table
                columns={columns}
                dataSource={data}
                pagination={false}
                footer={() => {
                    return (
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <PlusSquareOutlined style={{ marginRight: '6px' }} />
                            添加表格数据
                        </div>
                    );
                }}
            />
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
TableComponent.propTypes = {};

export default TableComponent;
