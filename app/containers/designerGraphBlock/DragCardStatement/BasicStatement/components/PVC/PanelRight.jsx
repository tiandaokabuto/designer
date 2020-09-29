import React, { Fragment } from 'react';
import { Switch, Input, Button, Select, DatePicker, List, Radio } from 'antd';
import _uniqueId from 'lodash/uniqueId';

// import "./layout/PanelLeft/layoutPanel.less";
import './layout/PanelRight/layoutPanel.less';

import {
  FormOutlined,
  BuildOutlined,
  FileAddOutlined,
  SkinOutlined,
} from '@ant-design/icons';
import { uniqueId } from 'lodash';

import {
  SUBMIT_COMPONENT,
  CANCEL_COMPONENT,
} from './components/componentTypes';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const PanelRight = props => {
  let {
    dataList,
    focusItemId,
    handleChange,
    layout,
    setLayout,
    findPosition,
    device,
  } = props;
  const focusItem = dataList.find(item => item.id === focusItemId);

  const NAME_MAP = {
    basic: [
      { key: 'label', name: '标签名称' },
      { key: 'desc', name: '提示信息' },
    ],
    values: [
      { key: 'key', name: '变量名' },
      { key: 'value', name: '显示值' },
      { key: 'password', name: '密码类型' },
    ],
    options: [
      { key: 'dataSource', name: '数据源' },
      {
        key: 'selectedType',
        name: '选择框类型',
        values: [
          { label: '单选', value: 'radio' },
          { label: '多选', value: 'multiple' },
        ],
      },
    ],
    rule: [
      {
        key: 'validRule',
        name: '校验规则',
      },
    ],
    layout: [
      {
        key: 'width',
        name: '组件宽度',
        values: [1, 2, 5, 10, 15, 20, 25, 30, 33.3, 40, 50, 60, 75, 100],
      },
    ],
  };

  const getComponentType = (desc, item, type = 'unkown') => {
    console.log(`desc`, desc, type);
    switch (item) {
      case 'label':
        return (
          <Input
            value={desc[item]}
            onChange={e => {
              desc[item] = e.target.value;
              handleChange();
            }}
            size="small"
            style={{ width: 193 }}
          />
        );
      case 'desc':
        return (
          <TextArea
            size="small"
            value={desc[item]}
            onChange={e => {
              desc[item] = e.target.value;
              handleChange();
            }}
          ></TextArea>
        );
      case 'value':
        return (
          <Input
            value={desc[item]}
            onChange={e => {
              desc[item] = e.target.value;
              handleChange();
            }}
            size="small"
            style={{ width: 193 }}
          />
        );
      case 'key':
        return (
          <Input
            value={desc[item]}
            onChange={e => {
              desc[item] = e.target.value;
              handleChange();
            }}
            size="small"
            style={{ width: 193 }}
          />
        );

      case 'password':
        return (
          <Radio.Group
            value={desc[item]}
            onChange={e => {
              desc[item] = e.target.value;
              handleChange();
            }}
            optionType="button"
            buttonStyle="solid"
            size="small"
          >
            <Radio.Button value="true">是</Radio.Button>
            <Radio.Button value="false">否</Radio.Button>
          </Radio.Group>
        );
      case 'dataSource':
        return (
          <Input
            value={desc[item]}
            onChange={e => {
              desc[item] = e.target.value;
              handleChange();
            }}
            size="small"
            style={{ width: 193 }}
          />
        );
      case 'selectedType':
        return (
          <Radio.Group
            style={{ marginLeft: -13 }}
            value={desc[item]}
            onChange={e => {
              desc[item] = e.target.value;
              handleChange();
            }}
            optionType="button"
            buttonStyle="solid"
            size="small"
            options={
              NAME_MAP.options.find(item => item.key === 'selectedType').values
            }
          />
        );
      case 'width':
        return (
          <Radio.Group
            value={desc[item]}
            onChange={e => {
              desc[item] = e.target.value;
              const position = findPosition(focusItemId, layout[device].grid);
              if (position.length !== 0) {
                const row = position[0];
                const col = position[1];
                try {
                  layout[device].grid[row][col].width = `${e.target.value}%`;
                } catch (e) {
                  console.log(e);
                }
                setLayout({ ...layout });
              }

              handleChange();
            }}
            optionType="button"
            buttonStyle="solid"
            size="small"
            options={
              type === SUBMIT_COMPONENT || type === CANCEL_COMPONENT
                ? DEFAULT_100
                : NAME_MAP.layout
                    .find(item => item.key === 'width')
                    .values.map(value => {
                      return {
                        label: `${value}%`,
                        value,
                      };
                    })
            }
          />
        );
      default:
      // return (
      //   <Input
      //     // value={desc[item]}
      //     onChange={(e) => {
      //       desc[item] = e.currentTarget.value;
      //       handleChange();
      //     }}
      //   />
      // );
    }
  };

  const getInputs = typeList => {
    return typeList.map((item, index) => {
      if (Object.keys(focusItem.attribute).indexOf(item.key) >= 0) {
        console.log(item.key);
        return (
          <div className="rightpanel-item" key={`${item.name}_${index}`}>
            <span style={{ marginBottom: '4px' }}>{item.name}</span>

            {/** 用对应类型的配置参数.attribute 生成配置填写框 */}
            {getComponentType(focusItem.attribute, item.key, focusItem.type)}
          </div>
        );
      }
    });
  };

  return (
    <Fragment>
      <div
        className="panel-right-config"
        style={{ textAlign: 'center', height: 38 }}
      >
        参数配置面板
      </div>
      <div className="panel-left-layoutPanel">
        <p className="frontTag">
          <FormOutlined /> 描述参数
        </p>
        {/** 根据分类遍历所需要填写的变量 */}
        {getInputs(NAME_MAP.basic)}
        <p className="frontTag">
          <FormOutlined /> 关键参数
        </p>
        {/** 根据分类遍历所需要填写的变量 */}
        {getInputs(NAME_MAP.values)}
        <p className="frontTag">
          <FormOutlined /> 其他参数
        </p>
        {/** 根据分类遍历所需要填写的变量 */}
        {getInputs(NAME_MAP.options)}
        <p className="frontTag">
          <FormOutlined /> 布局
        </p>
        {/** 根据分类遍历所需要填写的变量 */}
        {getInputs(NAME_MAP.layout)}
      </div>
    </Fragment>
  );
};

export default PanelRight;

const DEFAULT_100 = new Array(20).fill(1).reduce((pre, item, index) => {
  return [...pre, { label: `${(index + 1) * 5}%`, value: (index + 1) * 5 }];
}, []);
