import React, { useState, useRef } from 'react';
import { Input, Button, Modal } from 'antd';
import PropTypes from 'prop-types';

import AutoCompleteInputParam from './AutoCompleteInputParam';
import { useEffect } from 'react';

const RenderWithPlusInput = ({ render, modelValue, onChange, ...props }) => {
  const inputEl = useRef(null);
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState(modelValue);
  const { TextArea } = Input;

  useEffect(() => {
    setValue(modelValue);
  }, [modelValue]);

  const handleOk = () => {
    setVisible(false);
    onChange(value);
    // param.updateId = true;
  };

  const handleCancel = () => {
    setVisible(false);
  };

  return (
    <div className="parampanel-item">
      <div className="parampanel-item-adapt">
        {render({ onChange, ...props })}
      </div>
      <Button onClick={() => setVisible(true)}>...</Button>
      <Modal
        title="请输入内容"
        visible={visible}
        onOk={() => handleOk()}
        onCancel={handleCancel}
      >
        <TextArea
          rows={4}
          value={value}
          onChange={e => {
            setValue(e.target.value);
          }}
        />
      </Modal>
    </div>
  );
};

RenderWithPlusInput.propTypes = {
  modelValue: PropTypes.string.isRequired,
  render: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default RenderWithPlusInput;
