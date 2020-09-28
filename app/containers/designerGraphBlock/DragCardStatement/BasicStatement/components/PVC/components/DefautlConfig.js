import React from 'react';
import { Progress } from 'antd';
import {
  DownOutlined,
  EditFilled,
  AreaChartOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  DownSquareOutlined,
  FormOutlined,
  UploadOutlined,
  DatabaseOutlined,
  TableOutlined,
  CalendarOutlined,
  CheckOutlined,
  DesktopOutlined,
  MobileOutlined,
  TabletOutlined,
  RotateRightOutlined,
  LeftCircleFilled,
  PictureOutlined,
  MinusOutlined,
} from '@ant-design/icons';

import {
  INPUT_COMPONENT,
  RADIO_COMPONENT,
  IMAGE_COMPONENT,
  SUBMIT_COMPONENT,
  UPLOAD_COMPONENT,
  DOWNLOAD_COMPONENT,
  SELECT_COMPONENT,
  UPLOADIMAMGS_COMPONENT,
  CANCEL_COMPONENT,
} from './componentTypes';

export const inputType = {
  type: INPUT_COMPONENT,
  attribute: {
    label: '文本框',
    desc: '',
    value: '',
    key: '赋值的变量名',
    password: 'false',
    validRule: '',
    width: 100,
    required: true,
  },
  icon: <img src={require('../assets/input.svg')} className="pvc-btn-icon" />,
};

export const imageType = {
  type: IMAGE_COMPONENT,
  // 配置项
  attribute: {
    label: '图片控件',
    desc: '',
    value: '',
    width: 100,
  },
  // 组件图标
  icon: <img src={require('../assets/image.svg')} className="pvc-btn-icon" />,
};

export const submitType = {
  type: SUBMIT_COMPONENT,
  attribute: {
    label: '提交按钮',
    width: 100,
  },
  icon: <img src={require('../assets/btn.svg')} className="pvc-btn-icon" />,
};

export const cancelType = {
  type: CANCEL_COMPONENT,
  icon: <img src={require('../assets/error.svg')} className="pvc-btn-icon" />,
  attribute: {
    label: '取消按钮',
    width: 100,
  },
};

export const uploadType = {
  type: UPLOAD_COMPONENT,
  attribute: {
    label: '文件上传',
    desc: '',
    value: '',
    width: 100,
  },
  icon: <img src={require('../assets/upload.svg')} className="pvc-btn-icon" />,
};

export const downloadType = {
  icon: (
    <img src={require('../assets/download.svg')} className="pvc-btn-icon" />
  ),
  type: DOWNLOAD_COMPONENT,
  attribute: {
    label: '文件下载',
    desc: '',
    value: '',

    width: 100,
  },
};

export const selectType = {
  type: SELECT_COMPONENT,
  attribute: {
    label: '下拉框',
    desc: '',
    value: '',
    key: '赋值的变量名',
    dataSource: '[]',
    selectedType: 'radio',
    width: 100,
    require: true,
  },
  icon: (
    <img src={require('../assets/selector.svg')} className="pvc-btn-icon" />
  ),
};

export const uploadImgsType = {
  type: UPLOADIMAMGS_COMPONENT,
  attribute: {
    label: '多图上传',
    desc: '',
    value: '[]',
    width: 100,
  },
  icon: <img src={require('../assets/imageUp.svg')} className="pvc-btn-icon" />,
};
export const defaultConfig = {
  inputType, // 输入框
  imageType, //图片控件
  submitType, //提交按钮
  uploadType, //上传按钮
  downloadType, //下载按钮
  selectType, //下拉框
  uploadImgsType, //多图上传

  // radioType, // 单选框
};

// export const radioType = {
//   type: RADIO_COMPONENT,
//   icon: <CheckCircleOutlined />,
//   label: '单项选择',
//   value: '',
//   width: 100,
//   required: false,
//   item: [
//       {
//           name: '选项A',
//           placeholder: '请输入提示',
//           value: '',
//       },
//       {
//           name: '选项B',
//           placeholder: '请输入提示',
//           value: '',
//       },
//       {
//           name: '选项C',
//           placeholder: '请输入提示',
//           value: '',
//       },
//   ],
// };
