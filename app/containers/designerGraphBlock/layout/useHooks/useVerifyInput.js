import { useState } from 'react';
import schema from 'async-validator';

const numberDescriptor = {
  value: {
    type: 'number',
    required: false,
    validator: (rule, value) => /^[0-9]*$/g.test(value),
  },
};
const NumberValidator = new schema(numberDescriptor);

const VALIDATOR = {
  NumberValidator,
};

const ERROR_MESSAGE = {
  NumberValidator: '请填入数值类型',
};

const getValidType = param => {
  const paramType = param.paramType;
  if (
    paramType === 0 ||
    (Array.isArray(paramType) &&
      paramType.length === 1 &&
      paramType[0] === 'Number')
  ) {
    return 'NumberValidator';
  }
  return undefined;
};

export default param => {
  const validType = getValidType(param);
  const validator = VALIDATOR[validType];

  const [err, setErr] = useState(false);
  const [message, setMessage] = useState(ERROR_MESSAGE[validType]);

  if (!validator) {
    return [false, '', () => {}];
  }

  const handleValidate = data => {
    // 2020.05.15 暂时屏蔽类型检查,tb任务id: lcyb-896
    /*  validator.validate(data, errors => {
      if (errors) {
        setErr(true);
      } else {
        err && setErr(false);
      }
    }); */
  };
  return [err, message, handleValidate];
};
