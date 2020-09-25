import React, { useState, useEffect } from 'react';
import { Menu } from 'antd';
import './index.scss';
const { SubMenu } = Menu;

export const generateMenu = arr => {
  return (
    <Menu style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}>
      {arr.map((subMenu, index) => {
        if (subMenu.subMenu) {
          return (
            <SubMenu
              key={index}
              style={{ width: '154px' }}
              title={subMenu.title}
            >
              {subMenu.subMenu.map((item, index2) => {
                return (
                  <Menu.Item key={index2} disabled={item.disabled}>
                    <div
                      className="menu-dropdown"
                      onClick={item.onClick || (() => {})}
                    >
                      <span>{item.title}</span>
                      <span>{item.shortcut}</span>
                    </div>
                  </Menu.Item>
                );
              })}
            </SubMenu>
          );
        } else {
          return (
            <Menu.Item key={index} disabled={subMenu.disabled}>
              <div
                className="menu-dropdown"
                onClick={subMenu.onClick || (() => {})}
              >
                <span>{subMenu.title}</span>
                {/* <a onClick={subMenu.onClick || (() => {})}>
                  
                  {subMenu.shortcut ? subMenu.shortcut : ''}
                </a> */}
                <span>{subMenu.shortcut}</span>
              </div>
            </Menu.Item>
          );
        }
      })}
    </Menu>
  );
};
