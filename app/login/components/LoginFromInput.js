import React from 'react';
import { Input } from 'antd';
import PropTypes from 'prop-types';

const { Password } = Input;

const LoginFromInput = ({
  inputValue,
  handleInputVauleChange,
  label,
  placeholder,
  type,
  formItemClassName,
}) => {
  const formItemContentClass = `login-right-form-item ${formItemClassName}`;

  return (
    <div className={formItemContentClass}>
      <div>{label}</div>
      {type === 'password' ? (
        <Password
          value={inputValue}
          placeholder={placeholder}
          onChange={e => {
            handleInputVauleChange(e.target.value);
          }}
        />
      ) : (
        <Input
          value={inputValue}
          placeholder={placeholder}
          onChange={e => {
            handleInputVauleChange(e.target.value);
          }}
        />
      )}
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
