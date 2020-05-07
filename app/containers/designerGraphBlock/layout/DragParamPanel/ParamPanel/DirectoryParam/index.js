import React, { useState, useEffect } from 'react';
import { Radio } from 'antd';

import Param from '../components/LabelParam';
import FileParam from '../FileParam';

export default ({
  param,
  handleEmitCodeTransform,
  keyFlag,
  setFlag,
  aiHintList,
  appendDataSource,
  handleValidate,
}) => {
  const [tag, setTag] = useState(param.tag ? param.tag : 1);

  useEffect(() => {
    if (!param.tag) {
      param.tag = 1;
    }
    if (!Array.isArray(param.valueList)) {
      param.valueList = [
        {
          ...param,
          id: 'directory',
          cnName: '目录',
          enName: 'directory',
          value: '',
          paramType: ['String'],
        },
        {
          ...param,
          id: 'fileName',
          cnName: '文件名',
          enName: 'fileName',
          value: '',
          paramType: ['String'],
        },
      ];
    }
  }, []);

  const onChange = e => {
    const value = e.target.value;
    setTag(value);
    param.tag = value;
    param.forceUpdate += 1;
    handleEmitCodeTransform();
  };

  return (
    <React.Fragment>
      <span className="param-title" title={param.desc}>
        {param.cnName}
      </span>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Radio.Group onChange={onChange} value={tag}>
          <Radio value={1}>选择模式</Radio>
          <Radio value={2}>拼接模式</Radio>
        </Radio.Group>
      </div>
      {tag === 2 ? (
        param.valueList.map(item => {
          return (
            <Param
              param={item}
              key={`${param.enName}-${item.id}`}
              onChange={value => {
                param.forceUpdate += 1;
              }}
              aiHintList={aiHintList}
              appendDataSource={appendDataSource}
              keyFlag={keyFlag}
              handleEmitCodeTransform={handleEmitCodeTransform}
              handleValidate={handleValidate}
            />
          );
        })
      ) : (
        <FileParam
          param={param}
          setFlag={setFlag}
          keyFlag={keyFlag}
          fileType="openFile"
          handleEmitCodeTransform={handleEmitCodeTransform}
          filters={param.filter}
        />
      )}
    </React.Fragment>
  );
};
