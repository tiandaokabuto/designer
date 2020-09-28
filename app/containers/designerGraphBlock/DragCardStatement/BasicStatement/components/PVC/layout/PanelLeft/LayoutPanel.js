import React, { useState, useEffect } from "react";
import { List, Select, Tag, Radio, Input, Button, message } from "antd";
import { LayoutOutlined, CheckSquareOutlined } from "@ant-design/icons";
import { options } from "less";
import cloneDeep from "lodash/cloneDeep";

import { device } from "../../components/DeviceConfig";
import "./layoutPanel.less";

const { Option } = Select;

export default (props) => {
  const {
    handleAddComponent,
    currentDevice,
    setCurrentDevice,
    layout,
    setLayout,
  } = props;

  // 当前选中的设备
  //const [currentDevice, setCurrentDevice] = useState("device-mobile-iphone678");

  // 启用的布局方案
  const [usedLayout, setUsedLayout] = useState([]);

  useEffect(() => {
    setUsedLayout(Object.keys(layout));
    // console.log(item.grid);
  }, [layout]);

  useEffect(() => {
    console.log(layout);
    usedLayout.forEach((device) => {
      if (!layout[device]) {
        layout[device] = cloneDeep(layout[Object.keys(layout)[0]]);
      }
      setLayout(layout);
    });
  }, [usedLayout]);

  // 当前的属性参数
  const [options, setOptions] = useState({
    layoutPadding: "double",
    rowsNumber: 1,
  });

  // useEffect(() => {
  //   // 假如把当前的layout都删了，就加回去

  //   return () => {};
  // }, [usedLayout]);

  return (
    <div class="panel-left-layoutPanel">
      <p className="frontTag">
        <LayoutOutlined /> 当前方案
      </p>
      <Select
        showSearch
        style={{ width: "100%" }}
        placeholder="选择当前配置的视图"
        optionFilterProp="children"
        onChange={(e) => setCurrentDevice(e)}
        // onFocus={onFocus}
        // onBlur={onBlur}
        // onSearch={onSearch}
        // filterOption={(input, option) =>
        //   option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        // }
        value={currentDevice}
        listHeight={600}
      >
        {device.map((item) => {
          if (usedLayout.find((used) => item.key === used)) {
            return (
              <Option value={item.key}>
                <Tag>
                  {item.icon}
                  {` ${item.type}`}
                </Tag>
                {item.name}
              </Option>
            );
          }
        })}
      </Select>
      <p style={{ marginTop: 12 }}>
        {" "}
        <span style={{ paddingRight: 20 }}>布局间隔</span>
        <Radio.Group
          value={options.layoutPadding}
          onChange={(e) => {
            setOptions({ ...options, layoutPadding: e.target.value });
          }}
          options={[
            { label: "宽松", value: "double" },
            { label: "紧凑", value: "tiny" },
          ]}
          optionType="button"
          buttonStyle="solid"
          size="small"
        />
      </p>
      <hr style={{ borderTop: "1px solid #32a680" }} />

      <div
        class="layoutPreview"
        style={{ marginTop: 12, paddingBottom: 10, display: "block" }}
      >
        {" "}
        <div class="left">
          <span style={{ paddingRight: 20 }}>布局缩略</span>
        </div>
        <div class="right">
          {options.rowsNumber
            ? new Array(6 * options.rowsNumber).fill(1).map((i) => {
                return (
                  <div
                    class="box"
                    style={{
                      flex: `0 0 ${parseInt(100 / options.rowsNumber)}%`,
                    }}
                  >
                    <div class="inner"></div>
                  </div>
                );
              })
            : ""}
        </div>
      </div>

      <p style={{ marginTop: 12 }}>
        {" "}
        <span style={{ paddingRight: 20 }}>最大列数</span>
        <Input
          value={options.rowsNumber}
          defaultValue={1}
          size="small"
          type="number"
          max={24}
          min={1}
          style={{ width: 88 }}
          onChange={(e) => {
            console.log(e.currentTarget.value);
            if (parseInt(e.currentTarget.value) > 24) {
              setOptions({ ...options, rowsNumber: 24 });
            } else {
              setOptions({ ...options, rowsNumber: e.currentTarget.value });
            }
          }}
          onBlur={(e) => {
            let num;
            if (e.currentTarget.value) {
              num = parseInt(e.currentTarget.value);
            } else {
              num = 1;
            }
            if (isNaN(num) || !num) num = 1;
            setOptions({ ...options, rowsNumber: num });
          }}
        />
        <Button
          // type="primary"
          size="small"
          style={{ width: 38, marginRight: 6, marginLeft: 12 }}
          onClick={() => {
            if (options.rowsNumber < 24) {
              setOptions({ ...options, rowsNumber: (options.rowsNumber += 1) });
            }
          }}
        >
          +
        </Button>
        <Button
          // type="primary"
          size="small"
          style={{ width: 38 }}
          onClick={(e) => {
            if (options.rowsNumber > 1) {
              return setOptions({
                ...options,
                rowsNumber: (options.rowsNumber -= 1),
              });
            }
          }}
        >
          -
        </Button>
      </p>

      <hr style={{ borderTop: "1px solid #32a680" }} />

      <p style={{ marginTop: 12 }}>
        {" "}
        <span style={{ paddingRight: 20 }}>像素宽度</span>
        <Input
          value={
            device.find((d) => d.key === currentDevice)
              ? device.find((d) => d.key === currentDevice).width
              : "未知"
          }
          size="small"
          style={{ width: 88 }}
          disabled
        />{" "}
        px
      </p>

      <p style={{ marginTop: 12 }}>
        {" "}
        <span style={{ paddingRight: 20 }}>像素高度</span>
        <Input
          value={
            device.find((d) => d.key === currentDevice)
              ? device.find((d) => d.key === currentDevice).height
              : "未知"
          }
          size="small"
          style={{ width: 88 }}
          disabled
        />{" "}
        px
      </p>

      <hr style={{ borderTop: "1px solid #32a680" }} />

      <p style={{ marginTop: 12 }}>
        {" "}
        <span style={{ paddingRight: 20 }}>边缘边距</span>
        <Input value={options.padding} size="small" style={{ width: 88 }} /> px
      </p>

      <p style={{ marginTop: 12 }}>
        {" "}
        <span style={{ paddingRight: 20 }}>行内间距</span>
        <Input value={options.padding} size="small" style={{ width: 88 }} /> px
      </p>

      <p className="frontTag" style={{ marginTop: 12 }}>
        <CheckSquareOutlined /> 启用方案
      </p>
      <Select
        mode="multiple"
        allowClear
        style={{ width: "100%" }}
        placeholder="启用的方案"
        value={usedLayout}
        onChange={(e) => {
          if (e.indexOf(currentDevice) < 0) {
            message.info("当前编辑的方案不能被删除");
            return setUsedLayout([...e, currentDevice]);
          }

          if (e.length < 1) {
            return message.info("不能删除所有布局方式");
          }
          setUsedLayout(e);
        }}
      >
        {device.map((item) => {
          return (
            <Option value={item.key}>
              <Tag>
                {item.icon}
                {` ${item.type}`}
              </Tag>
              {item.name}
            </Option>
          );
        })}
      </Select>
    </div>
  );
};
