import React, { useState, useEffect } from 'react';
import { Upload, message, Divider } from 'antd';
import { InboxOutlined, DeleteOutlined } from '@ant-design/icons';
import '../public.less';

const { Dragger } = Upload;

const ImageComponent = props => {
    let { item, handleSelect, focusItemId, handleDeleteComponent } = props;

    const UpLoadProps = {
        name: 'file',
        multiple: true,
        action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
        onChange(info) {
            const { status } = info.file;
            if (status !== 'uploading') {
                console.log(info.file, info.fileList);
            }
            if (status === 'done') {
                message.success(`${info.file.name} file uploaded successfully.`);
            } else if (status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
    };

    return (
        <div
            className={`component-contain ${focusItemId === item.id ? 'item-selected' : ''}`}
            style={{ width: item.width, padding: '0px 12px' }}
            onClick={handleSelect}
        >
            <div className="component-title">上传文件</div>
            <Dragger {...UpLoadProps} style={{ width: '50%', margin: '0 auto' }}>
                <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                </p>
                <p className="ant-upload-text">点击或拖拽文件上传</p>
                {/* <p className="ant-upload-hint">
                    Support for a single or bulk upload. Strictly prohibit from uploading company
                    data or other band files
                </p> */}
            </Dragger>
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
ImageComponent.propTypes = {};

export default ImageComponent;
