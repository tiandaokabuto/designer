import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Input, Select, AutoComplete } from 'antd';
import uniqueId from 'lodash/uniqueId';
import axios from 'axios';

import event from '../../eventCenter';
import api, { config } from '../../../../../api';

import './ParamPanel.scss';

const { Option } = Select;
const { TextArea } = Input;

const componentType = {
  INPUT: 0,
  SELECT: 1,
};

const getComponentType = (
  param,
  handleEmitCodeTransform,
  cards,
  keyFlag,
  aiHintList = {}
) => {
  const stopDeleteKeyDown = e => {
    if (e.keyCode === 46) {
      e.nativeEvent.stopImmediatePropagation();
    }
  };

  // 针对一些特殊的情况需要作出特殊的处理
  const [dataSource, setDataSource] = useState([]);

  if (param.enName === 'name' && dataSource.length === 0) {
    axios
      .get(api('getControllerParam'))
      .then(json => json.data)
      .then(json => {
        const data = json.data;
        if (json.code !== -1 && data) {
          setDataSource(data.map(item => item.name));
          return true;
        }
        return false;
      })
      .catch(err => console.log(err));
  }

  const handleChangeValue = (value, param, cards) => {
    param.value = value;
    handleEmitCodeTransform(cards);
  };

  if (param.enName === 'sqlStr') {
    return (
      <div className="sqlstr">
        <Input
          defaultValue={param.value.replace(/\s%\s.*/g, '')}
          onChange={e => {
            param.value = e.target.value;
            const numOfPlace = (e.target.value.match(/\%s/g) || []).length;
            if (param.placeholder.length < numOfPlace) {
              param.placeholder = param.placeholder.concat(
                new Array(numOfPlace - param.placeholder.length).fill(undefined)
              );
            } else {
              param.placeholder = param.placeholder.slice(0, numOfPlace);
            }
            handleEmitCodeTransform(cards);
          }}
          onKeyDown={e => stopDeleteKeyDown(e)}
        />
        请填写替换变量
        {param.placeholder.map((place, index) => {
          return (
            <Input
              defaultValue={place}
              key={index}
              style={{
                marginBottom: 8,
              }}
              onChange={e => {
                param.placeholder[index] = e.target.value;
                // 重新调整sql拼接形式
                param.value =
                  param.value.replace(/\s%\s.*/g, '') +
                  ` % (${param.placeholder
                    .filter(item => item !== undefined)
                    .join(', ')})`;
                handleEmitCodeTransform(cards);
              }}
              onKeyDown={e => stopDeleteKeyDown(e)}
            />
          );
        })}
      </div>
    );
  }
  switch (param.componentType) {
    case componentType.INPUT:
      return (
        /*  <Input
          defaultValue={param.value || param.default} // 可以加上 param.default 在参数面板显示默认值
          key={keyFlag || param.enName === 'xpath' ? uniqueId('key_') : ''}
          onChange={e => {
            param.value = e.target.value;
            handleEmitCodeTransform(cards);
          }}
        /> */
        <AutoComplete
          defaultValue={param.value || param.default}
          key={keyFlag || param.enName === 'xpath' ? uniqueId('key_') : ''}
          onChange={value => {
            handleChangeValue(value, param, cards);
          }}
          onSelect={value => {
            handleChangeValue(value, param, cards);
          }}
          dataSource={dataSource}
          filterOption={(inputValue, option) =>
            option.props.children
              .toUpperCase()
              .indexOf(inputValue.toUpperCase()) !== -1
          }
        >
          <TextArea className="custom" onKeyDown={e => stopDeleteKeyDown(e)} />
        </AutoComplete>
      );
    case componentType.SELECT:
      return (
        <Select
          style={{ width: '100%' }}
          defaultValue={param.value || param.default}
          dropdownMatchSelectWidth={false}
          onChange={value => {
            param.value = value;
            handleEmitCodeTransform(cards);
          }}
        >
          {param.valueMapping &&
            param.valueMapping.map(item => (
              <Option key={item.value} value={item.value}>
                {item.name}
              </Option>
            ))}
        </Select>
      );
    default:
      return <Input />;
  }
};

export default ({ checkedBlock, cards, handleEmitCodeTransform }) => {
  const [flag, setFlag] = useState(false);
  const aiHintList = useSelector(state => state.blockcode.aiHintList);
  useEffect(() => {
    const handleForceUpdate = () => {
      setFlag(true);
      setTimeout(() => {
        setFlag(false);
      }, 50);
    };
    event.addListener('forceUpdate', handleForceUpdate);
    return () => {
      event.removeListener('forceUpdate', handleForceUpdate);
    };
  }, []);

  return (
    <div className="parampanel">
      {checkedBlock && (
        <div className="parampanel-desc">
          <span>命令描述符</span>
          <Input
            defaultValue={checkedBlock.userDesc}
            onChange={e => {
              checkedBlock.userDesc = e.target.value;
              handleEmitCodeTransform(cards);
            }}
            onKeyDown={e => stopDeleteKeyDown(e)}
          />
        </div>
      )}
      <div className="parampanel-required">必选项</div>
      <div className="parampanel-content">
        {(checkedBlock.properties.required || []).map((param, index) => {
          return (
            <div key={checkedBlock.id + index} className="parampanel-item">
              <span className="param-title" title={param.desc}>
                {param.cnName}
              </span>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                {getComponentType(
                  param,
                  handleEmitCodeTransform,
                  cards,
                  flag,
                  aiHintList
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="parampanel-optional">选填项</div>
      <div className="parampanel-content">
        {(checkedBlock.properties.optional || []).map((param, index) => {
          return (
            <div key={checkedBlock.id + index} className="parampanel-item">
              <span className="param-title" title={param.desc}>
                {param.cnName}
              </span>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                {getComponentType(param, handleEmitCodeTransform, cards, flag)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
