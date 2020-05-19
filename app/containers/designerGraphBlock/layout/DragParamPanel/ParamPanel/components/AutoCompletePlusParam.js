import React, { useState, useRef } from 'react';
import { Input, Button, Modal } from 'antd';
import PropTypes from 'prop-types';

import AutoCompleteInputParam from './AutoCompleteInputParam';

const AutoCompletePlusParam = ({
  param,
  aiHintList,
  appendDataSource,
  keyFlag,
  handleEmitCodeTransform,
  handleValidate,
  onChange,
}) => {
  const inputEl = useRef(null);
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState(param.value || param.default);
  const { TextArea } = Input;

  const handleOk = param => {
    setVisible(false);
    inputEl.current.props.onChange(value);
    param.updateId = true;
  };

  const handleCancel = () => {
    setVisible(false);
  };

  return (
    <div className="parampanel-item">
      <div className="parampanel-item-adapt">
        <AutoCompleteInputParam
          ref={inputEl}
          param={param}
          aiHintList={aiHintList}
          appendDataSource={appendDataSource}
          keyFlag={keyFlag}
          handleEmitCodeTransform={handleEmitCodeTransform}
          onChange={value => {
            if (onChange) onChange(value);
            setValue(value);
          }}
          handleValidate={handleValidate}
        />
      </div>
      <Button onClick={() => setVisible(true)}>...</Button>
      <Modal
        title="请输入内容"
        visible={visible}
        onOk={() => handleOk(param)}
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

AutoCompletePlusParam.propTypes = {
  param: PropTypes.object.isRequired,
  aiHintList: PropTypes.object,
  appendDataSource: PropTypes.array,
  keyFlag: PropTypes.bool.isRequired,
  handleEmitCodeTransform: PropTypes.func.isRequired,
  handleValidate: PropTypes.func.isRequired,
  onChange: PropTypes.func,
};

AutoCompletePlusParam.defaultProps = {
  aiHintList: {},
  onChange: () => {},
};

export default AutoCompletePlusParam;
