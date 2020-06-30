import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, Modal } from 'antd';
import PropTypes from 'prop-types';

import AutoCompleteInputParam from './AutoCompleteInputParam';

const RenderWithPlusInput = ({ render, value, onChange, ...props }) => {
  const inputEl = useRef(null);
  const [visible, setVisible] = useState(false);
  const [textAreaValue, setTextAreaValue] = useState(value);
  const { TextArea } = Input;

  useEffect(() => {
    setTextAreaValue(value);
  }, [value]);

  const handleOk = () => {
    setVisible(false);
    onChange(textAreaValue);
    // param.updateId = true;
  };

  const handleCancel = () => {
    setVisible(false);
  };

  return (
    <div className="parampanel-item-content">
      <div className="parampanel-item-content-adapt">
        {render({ onChange, value, ...props })}
      </div>
      <Button
        style={{
          marginLeft: 8,
        }}
        icon="credit-card"
        onClick={() => setVisible(true)}
      ></Button>
      <Modal
        title="请输入内容"
        visible={visible}
        onOk={() => handleOk()}
        onCancel={handleCancel}
        width="650px"
      >
        <TextArea
          rows={17}
          value={textAreaValue}
          onChange={e => {
            setTextAreaValue(e.target.value);
          }}
        />
      </Modal>
    </div>
  );
};

RenderWithPlusInput.propTypes = {
  value: PropTypes.string,
  render: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};

RenderWithPlusInput.defaultProps = {
  value: '',
};

export default RenderWithPlusInput;
