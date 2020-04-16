import React, { Fragment, useState } from 'react';
import { Input, Radio, Select, Icon } from 'antd';

import './ConditionParam.scss';

const { Option } = Select;

export default ({
  cards,
  param,
  handleEmitCodeTransform,
  stopDeleteKeyDown,
  setFlag,
}) => {
  const [tag, setTag] = useState(param.tag);

  const handleDelete = index => {
    param.valueList.splice(index, 1);
    forceUpdate();
  };

  const handleAdd = () => {
    if (param.valueList) {
      param.valueList.push({
        v1: '',
        v2: '',
        rule: '',
        connect: '',
      });
      forceUpdate();
    }
  };

  const forceUpdate = () => {
    setFlag(true);
    setTimeout(() => {
      setFlag(false);
    }, 50);
  };

  return (
    <div>
      <Radio.Group
        style={{
          display: 'flex',
          marginBottom: '10px',
        }}
        onChange={e => {
          param.tag = e.target.value;
          param.forceUpdate = param.forceUpdate + 1;
          setTag(e.target.value);
          handleEmitCodeTransform(cards);
        }}
        defaultValue={param.tag}
      >
        <Radio value={1}>向导模式</Radio>
        <Radio value={2}>自定义模式</Radio>
      </Radio.Group>
      {tag === 1 ? (
        <div className="condition-param">
          <div>
            <div className="condition-param-ifcondition">
              <span>变量</span>
              <span>规则</span>
              <span>变量</span>
              <span>
                <Icon
                  type="plus"
                  className="condition-param-btn"
                  onClick={() => {
                    handleAdd();
                  }}
                />
              </span>
            </div>
            {(param.valueList || []).map((item, index) => {
              return (
                <Fragment key={index}>
                  <div className="condition-param-ifcondition">
                    <Input
                      placeholder="输入文本"
                      defaultValue={item.v1}
                      onChange={e => {
                        item.v1 = e.target.value;
                        param.forceUpdate = param.forceUpdate + 1;
                        handleEmitCodeTransform(cards);
                      }}
                    />
                    <Select
                      style={{ width: '100%' }}
                      defaultValue={item.rule}
                      dropdownMatchSelectWidth={false}
                      onChange={value => {
                        item.rule = value;
                        param.forceUpdate = param.forceUpdate + 1;
                        handleEmitCodeTransform(cards);
                      }}
                    >
                      {(param.valueMapping || []).map(ruleItem => (
                        <Option key={ruleItem.value} value={ruleItem.value}>
                          {ruleItem.name}
                        </Option>
                      ))}
                    </Select>
                    <Input
                      placeholder="输入"
                      defaultValue={item.v2}
                      onChange={e => {
                        item.v2 = e.target.value;
                        param.forceUpdate = param.forceUpdate + 1;
                        handleEmitCodeTransform(cards);
                      }}
                    />
                    <Icon
                      type="delete"
                      className="condition-param-btn"
                      onClick={() => {
                        handleDelete(index);
                        param.forceUpdate = param.forceUpdate + 1;
                        handleEmitCodeTransform(cards);
                      }}
                    />
                  </div>
                  <div className="condition-param-ifcondition">
                    <Radio.Group
                      defaultValue={item.connect}
                      onChange={e => {
                        item.connect = e.target.value;
                        param.forceUpdate = param.forceUpdate + 1;
                        handleEmitCodeTransform(cards);
                      }}
                      style={{
                        display: 'flex',
                      }}
                    >
                      <Radio value="and">且</Radio>
                      <Radio value="or">或</Radio>
                    </Radio.Group>
                  </div>
                </Fragment>
              );
            })}
          </div>
        </div>
      ) : (
        <Input
          defaultValue={param.value || param.default} // 可以加上 param.default 在参数面板显示默认值
          // key={keyFlag || param.enName === 'xpath' ? uniqueId('key_') : ''}
          onChange={e => {
            param.value = e.target.value;
            handleEmitCodeTransform(cards);
            if (param.listeners) {
              param.listeners.forEach(callback => {
                if (typeof callback === 'function') {
                  callback(e.target.value);
                }
              });
            }
          }}
          onKeyDown={e => stopDeleteKeyDown(e)}
        />
      )}
    </div>
  );
};
