import React, { useEffect, useState, useRef } from 'react';
import {
  Tabs,
  Row,
  Col,
  List,
  Button,
  Input,
  Divider,
  Slider,
  Modal,
} from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import axios from 'axios';
import uniqueId from 'lodash/uniqueId';
import cloneDeep from 'lodash/cloneDeep';

import ComponentChoice from './components/ComponentChoice';

// import { Page } from 'sdcube';

import { device as deviceList } from './components/DeviceConfig';

import { PhoneOutlined, TabletOutlined } from '@ant-design/icons';

import {
  inputType,
  imageType,
  submitType,
  uploadType,
  downloadType,
  selectType,
  uploadImgsType,
} from './components/DefautlConfig';
// import InputComponent from './components/Input/ModelPanel';
// import SelectComponent from './components/Select/ModelPanel';
// import InputPanel from './components/Input/EditPanel';
import PanelRight from './PanelRight';

import PanelLeft from './layout/PanelLeft';

import './layout.less';

const PVC2 = ({ visible, setVisible, interactiveCard, saveChange }) => {
  // 表单元素数据
  const [dataList, setDataList] = useState([]);

  //scaleRate
  const [scaleRate, setScaleRate] = useState(1.0);

  // 当前选中的模式
  const [device, setDevice] = useState('device-pc-small');

  // 表单的布局信息
  const [layout, setLayout] = useState({
    // 移动
    // "device-mobile-iphone678": {
    //   grid: [],
    // },

    'device-pc-small': {
      grid: [],
    },
  });

  // 启用的布局方案
  const [usedLayout, setUsedLayout] = useState(['device-pc-small']);

  useEffect(() => {
    console.log(interactiveCard);
    const data = JSON.parse(interactiveCard.properties.required[1].value);
    setDataList(Array.isArray(data) ? data : []);
    if (interactiveCard.layout) {
      let afterFilter = cloneDeep(interactiveCard.layout);
      ['cols', 'data', 'dataMap'].forEach(key => {
        if (afterFilter[key]) {
          delete afterFilter[key];
        }
      });
      setLayout(afterFilter);
      setUsedLayout(Object.keys(afterFilter));
      setDevice(Object.keys(afterFilter)[0]);
    }
  }, [interactiveCard.layout]);

  const [deviceConfig, setDeviceConfig] = useState({});

  useEffect(() => {
    setDeviceConfig(deviceList.find(item => item.key === device));
  }, [device]);

  const getUniqueIdForPVC = (device, str) => {
    let id = uniqueId(str);

    const isDuplicate = (device, id) => {
      const arr = layout[device].grid;
      console.log(arr);
      // layou = [[], [], []]
      for (let i = 0; i < arr.length; i++) {
        // layout[i] = [{}, {}, {}]
        console.log(arr[i]);
        const target = arr[i].find(item => item.id === id);
        if (target) {
          return true;
        }
      }
    };

    while (true) {
      if (isDuplicate(device, id)) {
        id = uniqueId(str);
        continue;
      } else {
        return id;
      }
    }
  };

  // 处理修改参数面板
  const handleChange = () => {
    setDataList([...dataList]);
  };

  const [mobileLayout, setMobileLayout] = useState([]);
  const [ipadLayout, setIpadLayout] = useState([]);
  const [ipadVerticalLayout, setIpadVerticalLayout] = useState([]);
  const [pcVerticalLayout, setPcVerticalLayout] = useState([]);

  // 当前选中的表单元素id
  const [focusItemId, setFocusItemId] = useState('');

  const handleAddComponent = itemData => {
    // 插入元素
    const newItem = cloneDeep(itemData);
    let id = getUniqueIdForPVC(device, 'col_');
    newItem.id = id
    newItem.attribute.id = newItem.id;
    setDataList([...dataList, newItem]);
    // let newLayout = [];
    // if (device === 'device-mobile') {
    //   newLayout = [...mobileLayout];
    //   newLayout.push([
    //     {
    //       id: newItem.id,
    //       span: 24,
    //     },
    //   ]);
    //   console.log(newLayout);
    //   setMobileLayout(newLayout);
    // }
    // // 布局中对应插入元素
    Object.keys(layout).forEach(device => {
      layout[device].grid.push([
        {
          id: newItem.id,
          width: newItem.attribute.width + `%`,
        },
      ]);
    });

    setLayout({ ...layout });
  };

  // 选中组件后，记录当前选中的id
  const handleSelect = id => setFocusItemId(id);

  // layout清除已删除组件的元素
  const deleteLayoutCellById = id => {
    console.log(`将要删除的`, id);
    const newArr = layout[device].grid.map(row => {
      return row.filter(item => item.id !== id);
    });
    // 过滤掉空的数组
    layout[device].grid = newArr.filter(item => item.length !== 0);
    // layout[device] = layout[device].grid.map(row => {
    //   return row.filter(item => item.id !== id);
    // });

    setLayout({ ...layout });
    setFocusItemId('');
    deleteComponent(id);
    // setMobileLayout(newArr);
    // if (device === 'device-mobile') {

    // }

    // const afterDeleteLayout = {};
    // Object.keys(layout).forEach(key => {
    //   afterDeleteLayout[key] = { grid: [] };
    //   // 遍历每一行Row中的Col元素
    //   layout[key].grid = layout[key].grid.map(row => {
    //     let temp = row.map(col => col.id !== id);
    //     // 假如这一行Col都删没了，则直接删掉这一Row
    //     if (temp.length > 0) {
    //       return temp;
    //     }
    //   });
    // });
  };

  // 删除组件
  const deleteComponent = id => {
    const newArr = dataList.filter(data => data.id !== id);
    console.log(newArr);
    setDataList(newArr);
  };

  // const showParamPanel = () => {
  //     console.log(focusItemId);
  //     if (focusItemId) {
  //         const focusItem = dataList.find(item => item.id === focusItemId);
  //         if (focusItem) {
  //             switch (focusItem.attribute.type) {
  //                 case INPUT_COMPONENT:
  //                     return (
  //                         <InputPanel
  //                             dataList={dataList}
  //                             focusItem={focusItem}
  //                             setDataList={setDataList}
  //                         />
  //                     );
  //                 default:
  //                     break;
  //             }
  //         }
  //     }
  // };

  const getLayoutGrid = () => {
    return layout ? (layout[device] ? layout[device].grid : []) : [];
    // switch (device) {
    //   case 'device-mobile':
    //     return mobileLayout;
    //   case 'device-ipad':
    //     return ipadLayout;
    //   case 'device-ipad-vertical':
    //     return ipadVerticalLayout;
    //   case 'device-pc-vertical':
    //     return pcVerticalLayout;
    //   default:
    //     break;
    // }
  };

  const moveUp = focusItemId => {
    console.log('上移', focusItemId);
    const arr = cloneDeep(layout[device].grid);
    // position = [row, col] row是目标所在的行，col是目标所在的列
    const position = findPosition(focusItemId, arr);
    if (position.length !== 0) {
      const row = position[0];
      const col = position[1];
      // 如果上一行不存在，就是当前所在项为第一行
      if (!arr[row - 1]) {
        // 在第一行前面加一个空行
        arr.unshift([]);
        // 此时arr[row]为新增之后的首行
        arr[row].push(arr[row + 1][col]);
        // 此时arr[row - 1]为原来的首行
        arr[row + 1].splice(col, 1);
      } else {
        arr[row - 1].push(arr[row][col]);
        arr[row].splice(col, 1);
      }

      layout[device].grid = arr.filter(item => item.length !== 0);
      setLayout({ ...layout });
    }
  };

  const moveDown = focusItemId => {
    console.log('下移', focusItemId);
    const arr = cloneDeep(layout[device].grid);
    // position = [row, col] row是目标所在的行，col是目标所在的列
    const position = findPosition(focusItemId, arr);
    if (position.length !== 0) {
      const row = position[0];
      const col = position[1];
      // 如果上一行存在
      if (!arr[row + 1]) {
        arr.push([]);
      }
      arr[row + 1].push(arr[row][col]);
      arr[row].splice(col, 1);
      layout[device].grid = arr.filter(item => item.length !== 0);
      setLayout({ ...layout });
    }
  };

  const findPosition = (focusItemId, grid) => {
    for (let i = 0; i < grid.length; i++) {
      const index = grid[i].findIndex(item => item.id === focusItemId);
      if (index !== -1) {
        return [i, index];
      }
    }
  };

  const componentList = [
    inputType,
    imageType,
    submitType,
    uploadType,
    downloadType,
    selectType,
    uploadImgsType,
  ];

  return (
    <Modal
      visible={visible}
      width="90%"
      bodyStyle={{
        padding: '0px',
        marginTop: '15px',
        // overflowX: 'hidden';
        overflowY: 'auto',
      }}
      centered
      closable={false}
      maskClosable={false}
      destroyOnClose={true}
      footer={
        <div>
          <Button
            onClick={() => {
              setVisible(false);
              setLayout(interactiveCard.layout);
              setFocusItemId('');
            }}
          >
            取消
          </Button>
          {/* <Button
          onClick={() => {
            handleProview(!isPreview);
            setIsPreview(preview => !preview);
          }}
        >
          {isPreview ? '取消预览' : '预览'}
        </Button> */}
          <Button
            type="primary"
            onClick={() => {
              if (layout) {
                Object.keys(layout).forEach(key => {
                  console.log(Object.keys(layout), key, usedLayout);
                  if (!usedLayout.find(useKey => key === useKey)) {
                    console.log(`我要删除! layout[key]`, key, layout[key]);
                    // temp[key] = cloneDeep(layout[key]);
                    delete layout[key];
                  }
                });
                // layout
                saveChange(layout, dataList);
              }
              interactiveCard.hasModified = true;
              setFocusItemId('');
              setVisible(false);
            }}
          >
            确定
          </Button>
        </div>
      }
    >
      <div className="pvc-designer">
        {/* <div className="panel-height">人机交互界面设计器</div> */}
        <div className="panel-left">
          <PanelLeft
            usedLayout={usedLayout}
            setUsedLayout={setUsedLayout}
            handleAddComponent={handleAddComponent}
            device={device}
            setDevice={setDevice}
            layout={layout}
            setLayout={setLayout}
          />
        </div>
        <div className="panel-middle">
          <div
            className={`device-mobile`}
            style={{
              width: deviceConfig.width,
              height: deviceConfig.height,
              transform: `scale(${scaleRate})`,
              position: 'relative',
              top: `${deviceConfig.width * 0.3 * (scaleRate - 0.9)}px`,
            }}
          >
            <div className="panel-title">
              <Input
                placeholder="流程配置单名称"
                defaultValue="默认表单标题"
                style={{
                  width: '80%',
                  display: 'block',
                  margin: '10px auto',
                  fontSize: '15px',
                  color: '#32a680',
                  border: 'none',
                  textAlign: 'center',
                  boxShadow: '0px 2px 8px #ececec',
                }}
              ></Input>
            </div>

            {getLayoutGrid().length >0 ? getLayoutGrid().map((row, index) => {
              return (
                <div
                  className="panel-content-row"
                  key={`${device}_${index}_` + uniqueId()}
                >
                  {row.map(col => {
                    return ComponentChoice({
                      id: col.id,
                      dataList,
                      focusItemId,
                      setFocusItemId,
                      setDataList,
                      deleteLayoutCellById,
                      moveUp,
                      moveDown,
                      width: col.width,
                    });
                  })}
                </div>
              );
            })
            :""
          }

            {/* <Divider style={{ margin: '12px 0px' }} /> */}

            {/* {getLayoutGrid().map((item, index) => {
            return (
              <Row key={index}>
                {item.map((item2) => {
                  return (
                    <Col key={item2.id} span={item2.span}>
                      {showComponent(item2.id)}
                    </Col>
                  );
                })}
              </Row>
            );
          })} */}
            {/*
          <div className="submit-btn">
            <Button
              style={{ display: dataList.length > 0 ? 'inline' : 'none' }}
              icon={<CheckOutlined />}
            >
              保存
            </Button>
          </div>
        */}
          </div>
        </div>
        <div className="panel-right">
          {focusItemId ? (
            <PanelRight
              focusItemId={focusItemId}
              dataList={dataList}
              handleChange={handleChange}
              findPosition={findPosition}
              layout={layout}
              device={device}
              setLayout={setLayout}
              findPosition={findPosition}
            />
          ) : (
            ''
          )}
        </div>

        <div className="pvc-slider">
          <div style={{ float: 'left', paddingRight: 30 }}>
            <span> 缩放比率 </span>
          </div>
          <div style={{ float: 'left', width: 180 }}>
            <Slider
              value={scaleRate * 100}
              min={10}
              max={150}
              step={5}
              onChange={value => {
                setScaleRate((value / 100).toFixed(2));
              }}
              marks={{
                10: '10',
                50: '50',
                100: '100',
                150: '150',
              }}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PVC2;
