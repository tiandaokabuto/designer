import React, { Component } from 'react';
import { RegisterNode } from 'gg-editor';

import Image from '../../../images/icon.png';
import ExecuteImage from '../../../images/execute.jpg';
import EditImage from '../../../images/edit.jpg';

class ProcessBlockNode extends Component {
  render() {
    const config = {
      // 设置锚点
      anchor: [
        [0.5, 0], // 上面边的中点
        [0.5, 1], // 下边边的中点
        [0, 0.5], // 左边的中点
        [1, 0.5], // 右边的结点
      ],
      draw(item) {
        const group = item.getGraphicGroup();
        const model = item.getModel();
        const width = 184;
        const height = 56;
        const x = -width / 2;
        const y = -height / 2;
        const borderRadius = 4;
        const keyShape = group.addShape('rect', {
          attrs: {
            x,
            y,
            width,
            height,
            radius: borderRadius,
            fill: '#edf6f7',
            stroke: 'rgba(61, 109, 204, 1)',
          },
        });

        // 左侧色条
        group.addShape('path', {
          attrs: {
            path: [
              ['M', x, y + borderRadius],
              ['L', x, y + height - borderRadius],
              [
                'A',
                borderRadius,
                borderRadius,
                0,
                0,
                0,
                x + borderRadius,
                y + height,
              ],
              ['L', x + borderRadius, y],
              ['A', borderRadius, borderRadius, 0, 0, 0, x, y + borderRadius],
            ],
            // fill: this.color_type,
          },
        });

        // 类型 logo
        group.addShape('image', {
          attrs: {
            img: Image,
            x: x + 16,
            y: y + 20,
            width: 20,
            height: 16,
          },
        });

        // 名称文本
        const label = model.label ? model.label : '';

        group.addShape('text', {
          attrs: {
            text: label,
            x: x + 52,
            y: y + 22,
            textAlign: 'start',
            textBaseline: 'top',
            fill: 'rgba(0,0,0,0.65)',
          },
        });

        // 状态 logo
        group.addShape('image', {
          attrs: {
            img: ExecuteImage,
            x: x + 200,
            y: y + 12,
            width: 16,
            height: 16,
            dataId: 'execute',
          },
        });
        group.addShape('image', {
          attrs: {
            img: EditImage,
            x: x + 200,
            y: y + 32,
            width: 16,
            height: 16,
            dataId: 'edit',
          },
        });

        return keyShape;
      },
    };
    return (
      <RegisterNode name="processblock" config={config} extend="flow-rect" />
    );
  }
}

export default ProcessBlockNode;
