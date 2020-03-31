import React from 'react';
import { Input } from 'antd';
import PropTypes from 'prop-types';

const LoginFromInput = ({
  inputValue,
  handleInputVauleChange,
  label,
  placeholder,
  type,
  formItemClassName,
}) => {
  return (
    <div className={formItemClassName}>
      <div>{label}</div>
      <Input
        value={inputValue}
        {...(type ? { type: 'password' } : {})}
        placeholder={placeholder}
        onChange={e => {
          handleInputVauleChange(e.target.value);
        }}
      />
    </div>
  );
};

LoginFromInput.propTypes = {
  inputValue: PropTypes.string,
  handleInputVauleChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  formItemClassName: PropTypes.string,
};

LoginFromInput.defaultProps = {
  inputValue: undefined,
  label: '',
  placeholder: '',
  formItemClassName: '',
};

export default LoginFromInput;
