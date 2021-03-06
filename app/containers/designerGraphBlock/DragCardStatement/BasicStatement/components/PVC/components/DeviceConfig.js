import React from "react";
import {
  FormOutlined,
  MobileOutlined,
  TabletOutlined,
  DesktopOutlined,
  LaptopOutlined,
  WindowsOutlined,
} from "@ant-design/icons";

export const device = [
  {
    type: "手机",
    icon: <MobileOutlined />,
    name: "4.7' iPhone6/7/8",
    key: "device-mobile-iphone678",
    width: 375,
    height: 667,
  },
  {
    type: "手机",
    icon: <MobileOutlined />,
    name: "5.5' iPhone6/7/8Plus",
    key: "device-mobile-iphone678Plus",
    width: 414,
    height: 736,
  },
  {
    type: "手机",
    icon: <MobileOutlined />,
    name: "5.8' iPhoneX/Xs",
    key: "device-mobile-iphoneX",
    width: 414,
    height: 736,
  },
  {
    type: "手机",
    icon: <MobileOutlined />,
    name: "6.5' iPhoneX/XsMax",
    key: "device-mobile-iphoneXMAX",
    width: 414,
    height: 896,
  },
  {
    type: "平板",
    icon: <TabletOutlined />,
    name: "9.7' ipad（竖屏）",
    key: "device-ipad",
    width: 768,
    height: 1024,
  },
  {
    type: "平板",
    icon: <TabletOutlined />,
    name: "9.7' ipad（横屏）",
    key: "device-ipad-vertical",
    width: 1024,
    height: 768,
  },
  {
    type: "电脑",
    icon: <DesktopOutlined />,
    name: "4:3 小型1000px宽度",
    key: "device-pc-small",
    width: 1000,
    height: 750,
  },
  {
    type: "笔记本",
    icon: <LaptopOutlined />,
    name: "14寸 宽屏1200px宽度",
    key: "device-laptop",
    width: 1000,
    height: 750,
  },
  {
    type: "超宽屏",
    icon: <WindowsOutlined />,
    name: "16:9 宽屏1600px宽度",
    key: "device-pc-long",
    width: 1600,
    height: 800,
  },
  {
    type: "1080P",
    icon: <WindowsOutlined />,
    name: "16:9 宽屏1800px宽度",
    key: "device-1080",
    width: 1800,
    height: 1000,
  },
  {
    type: "2K 1440P",
    icon: <WindowsOutlined />,
    name: "16:9 宽屏2400px宽度",
    key: "device-2k",
    width: 2400,
    height: 1350,
  },
  {
    type: "3K 3200",
    icon: <WindowsOutlined />,
    name: "16:9 宽屏3000px宽度",
    key: "device-3k",
    width: 3000,
    height: 1680,
  },
  {
    type: "4K 4096",
    icon: <WindowsOutlined />,
    name: "16:9 宽屏3800px宽度",
    key: "device-4k",
    width: 3800,
    height: 2140,
  },
];
