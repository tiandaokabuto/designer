import React, { Component } from 'react';
import { RegisterNode } from 'gg-editor';

import Image from '../../../images/judge.jpg';

export default class RhombusNode extends Component {
  render() {
    const config = {
      anchor: [
        [0.5, 0], // 上面边的中点
        [0.5, 1], // 下边边的中点
        [0, 0.5], // 左边的中点
        [1, 0.5], // 右边的结点
      ],
      draw(item) {
        const group = item.getGraphicGroup();
        const model = item.getModel();

        const keyShape = group.addShape('path', {
          attrs: {
            path: [
              ['M', 0, -52],
              ['L', 52, 0],
              ['L', 0, 52],
              ['L', -52, 0],
              ['L', 0, -52],
            ],
            fill: '#edf6f7',
            stroke: 'rgba(61, 109, 204, 1)',
          },
        });

        // 类型 logo
        group.addShape('image', {
          attrs: {
            img: Image,
            x: -12,
            y: -20,
            width: 24,
            height: 18,
          },
        });

        // 名称文本
        const label = model.label ? model.label : '';

        group.addShape('text', {
          attrs: {
            text: label,
            x: -12,
            y: 5,
            textAlign: 'start',
            textBaseline: 'top',
            fill: 'rgba(0,0,0,0.65)',
          },
        });

        return keyShape;
      },
      // 获取样式
      // getStyle(item) {
      //   return {
      //     stroke: 'rgba(61, 109, 204, 1)',
      //     fill: '#ecf5f6',
      //   };
      // },
      // // 激活样式
      // getActivedStyle(item) {
      //   return {
      //     stroke: '#F36364',
      //   };
      // },
      // // 选中样式
      // getSelectedStyle(item) {
      //   return {
      //     stroke: '#F36364',
      //     fill: '#F9ACD0',
      //   };
      // },
    };
    return (
      <RegisterNode name="rhombus-node" config={config} extend="flow-rhombus" />
    );
  }
}
