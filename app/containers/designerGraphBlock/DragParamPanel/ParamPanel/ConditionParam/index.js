import React, { Fragment, useState, useEffect } from 'react';
import { Input, Radio, Select, Icon } from 'antd';
import uniqueId from 'lodash/uniqueId';
import useForceUpdate from 'react-hook-easier/lib/useForceUpdate';

import './index.scss';

const { Option } = Select;

export default ({ cards, param, handleEmitCodeTransform }) => {
  const [flag, forceUpdate] = useForceUpdate();
  const [tag, setTag] = useState(param.tag);

  // 兼容旧数据
  useEffect(() => {
    if (param.valueList.length > 0) {
      if (param.valueList[0].id === undefined) {
        param.valueList.map((item, index) => {
          item.id = index;
          return item;
        });
      }
    }
  }, []);

  const handleDelete = index => {
    param.valueList.splice(index, 1);
    forceUpdate();
  };

  const handleAdd = () => {
    if (param.valueList) {
      let maxId = 0;
      if (param.valueList.length !== 0) {
        maxId = param.valueList[param.valueList.length - 1].id;
      }
      // 每次push到数组末尾，最大id为数组最后值的id
      // 如更改添加方式，同时变更id添加方式
      param.valueList.push({
        v1: '',
        v2: '',
        rule: '',
        connect: '',
        id: maxId + 1,
      });
      forceUpdate();
    }
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
        <Radio className="condition-radio" value={1}>
          向导模式
        </Radio>
        <Radio className="condition-radio" value={2}>
          自定义模式
        </Radio>
      </Radio.Group>
      {tag === 1 ? (
        <div className="condition-param">
          <div className="condition-param-ifcondition">
            <span>变量</span>
            <span>规则</span>
            <span>变量</span>
            <span>
              <Icon
                type="plus"
                className="condition-param-btn add-btn"
                onClick={() => {
                  handleAdd();
                }}
              />
            </span>
          </div>
          {(param.valueList || []).map((item, index) => {
            return (
              <Fragment key={item.id}>
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
                    className="condition-param-btn delete-btn"
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
      ) : (
        <Input
          className="condition-param-customize-input"
          defaultValue={param.value || param.default} // 可以加上 param.default 在参数面板显示默认值
          // key={keyFlag || param.enName === 'xpath' ? uniqueId('key_') : ''}
          onChange={e => {
            param.value = e.target.value;
            handleEmitCodeTransform(cards);
            param.forceUpdate = param.forceUpdate + 1;
          }}
        />
      )}
    </div>
  );
};
