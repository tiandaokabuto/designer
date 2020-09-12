import React, { useState, useRef } from 'react';
import { Input, Button, Modal } from 'antd';
import PropTypes from 'prop-types';

import AutoCompleteInputParam from './AutoCompleteInputParam';
import { encrypt } from '../../../../../login/utils';

const AutoCompletePlusParam = ({
  param,
  aiHintList,
  appendDataSource,
  keyFlag,
  handleEmitCodeTransform,
  handleValidate,
  onChange,
  isSelectEncty,
  cmdName,
}) => {
  const inputEl = useRef(null);
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState(String(param.value || param.default));
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
    <div className="parampanel-item-content">
      <div className="parampanel-item-content-adapt">
        <AutoCompleteInputParam
          ref={inputEl}
          cmdName={cmdName}
          param={param}
          aiHintList={aiHintList}
          appendDataSource={appendDataSource}
          keyFlag={keyFlag}
          handleEmitCodeTransform={handleEmitCodeTransform}
          onChange={value => {
            if (onChange) onChange(value);
          }}
          handleValidate={handleValidate}
          isSelectEncty={isSelectEncty}
        />
      </div>
      <Button
        onClick={() => {
          setValue(String(param.value || param.default));
          setVisible(true);
        }}
        style={{
          marginLeft: 8,
        }}
        disabled={isSelectEncty === 'True'}
        icon="credit-card"
      ></Button>
      <Modal
        title="请输入内容"
        visible={visible}
        onOk={() => handleOk(param)}
        onCancel={handleCancel}
        width="650px"
      >
        <TextArea
          rows={17}
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
  isSelectEncty: PropTypes.string,
};

AutoCompletePlusParam.defaultProps = {
  aiHintList: {},
  appendDataSource: [],
  onChange: () => {},
  isSelectEncty: 'False',
};

export default AutoCompletePlusParam;
