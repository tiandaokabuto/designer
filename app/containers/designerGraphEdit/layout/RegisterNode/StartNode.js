import React, { Component } from 'react';
import { RegisterNode } from 'gg-editor';

export default class StartNode extends Component {
  render() {
    const config = {
      anchor: [
        //[0.5, 0], // 上面边的中点
        [0.5, 1], // 下边边的中点
        //[0, 0.5], // 左边的中点
        //[1, 0.5], // 右边的结点
      ],
    };
    return (
      <RegisterNode name="start-node" config={config} extend="flow-circle" />
    );
  }
}
