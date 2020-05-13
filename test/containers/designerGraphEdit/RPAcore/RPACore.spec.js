import React, { useEffect, useState } from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import renderer from 'react-test-renderer';

import transformGGEditor from '../../../../app/containers/designerGraphEdit/RPAcore';

Enzyme.configure({ adapter: new Adapter() });

const graphData = {
  nodes: [
    {
      type: 'node',
      size: '40*40',
      shape: 'start-node',
      color: '#FA8C16',
      label: '开始',
      x: -235.5,
      y: -268.5,
      index: 0,
      style: { stroke: 'rgba(61, 109, 204, 1)', fill: '#ecf5f6' },
      id: 'f470f302',
    },
    {
      type: 'node',
      size: '184*56',
      shape: 'processblock',
      color: '#1890FF',
      label: '流程块',
      style: { stroke: 'rgba(61, 109, 204, 1)', fill: '#ecf5f6' },
      x: -235.5,
      y: -144,
      id: '08c7cc36',
      index: 1,
    },
    {
      type: 'node',
      size: '104*104',
      shape: 'rhombus-node',
      color: '#13C2C2',
      label: '判断',
      style: { stroke: 'rgba(61, 109, 204, 1)', fill: '#ecf5f6' },
      x: -229.5,
      y: -24,
      id: 'a40cba67',
      index: 2,
    },
    {
      type: 'node',
      size: '104*104',
      shape: 'rhombus-node',
      color: '#13C2C2',
      label: '判断',
      style: { stroke: 'rgba(61, 109, 204, 1)', fill: '#ecf5f6' },
      x: 233.5,
      y: 96,
      id: '5a3fab60',
      index: 3,
    },
    {
      type: 'node',
      size: '70*48',
      shape: 'end-node',
      color: '#722ED1',
      label: '结束',
      style: { stroke: 'rgba(61, 109, 204, 1)', fill: '#ecf5f6' },
      x: 244.5,
      y: 223,
      id: 'adf72bb1',
      index: 11,
    },
    {
      type: 'node',
      size: '104*104',
      shape: 'rhombus-node',
      color: '#13C2C2',
      label: '判断',
      style: { stroke: 'rgba(61, 109, 204, 1)', fill: '#ecf5f6' },
      x: -124.5,
      y: 334,
      id: '5a6e9501',
      index: 13,
    },
    {
      type: 'node',
      size: '184*56',
      shape: 'processblock',
      color: '#1890FF',
      label: '流程块',
      style: { stroke: 'rgba(61, 109, 204, 1)', fill: '#ecf5f6' },
      x: -170.5,
      y: 514,
      id: 'd58ed90d',
      index: 20,
    },
    {
      type: 'node',
      size: '184*56',
      shape: 'processblock',
      color: '#1890FF',
      label: '流程块',
      style: { stroke: 'rgba(61, 109, 204, 1)', fill: '#ecf5f6' },
      x: 313.5,
      y: 612,
      id: '88d30000',
      index: 21,
    },
    {
      type: 'node',
      size: '184*56',
      shape: 'processblock',
      color: '#1890FF',
      label: '流程块',
      style: { stroke: 'rgba(61, 109, 204, 1)', fill: '#ecf5f6' },
      x: 81.5,
      y: 485.5,
      id: '8739ded2',
      index: 22,
    },
    {
      type: 'node',
      size: '184*56',
      shape: 'processblock',
      color: '#1890FF',
      label: '流程块',
      style: { stroke: 'rgba(61, 109, 204, 1)', fill: '#ecf5f6' },
      x: -139,
      y: 208,
      id: 'abc38a04',
      index: 23,
    },
    {
      type: 'node',
      size: '184*56',
      shape: 'processblock',
      color: '#1890FF',
      label: '流程块',
      style: { stroke: 'rgba(61, 109, 204, 1)', fill: '#ecf5f6' },
      x: -282,
      y: 119.5,
      id: '0c3fa4e0',
      index: 24,
    },
    {
      type: 'node',
      size: '184*56',
      shape: 'processblock',
      color: '#1890FF',
      label: '流程块',
      style: { stroke: 'rgba(61, 109, 204, 1)', fill: '#ecf5f6' },
      x: -5.5,
      y: 72.5,
      id: 'b7d8d2e8',
      index: 25,
    },
  ],
  edges: [
    {
      source: 'f470f302',
      sourceAnchor: 0,
      target: '08c7cc36',
      targetAnchor: 0,
      id: '72710e33',
      index: 4,
    },
    {
      source: '08c7cc36',
      sourceAnchor: 1,
      target: 'a40cba67',
      targetAnchor: 0,
      id: 'b1c933cb',
      index: 5,
    },
    {
      source: 'a40cba67',
      sourceAnchor: 1,
      target: '0c3fa4e0',
      targetAnchor: 0,
      id: '991c3963',
      label: '是',
      index: 6,
    },
    {
      source: 'a40cba67',
      sourceAnchor: 3,
      target: 'b7d8d2e8',
      targetAnchor: 0,
      id: '106228a5',
      label: '否',
      index: 7,
    },
    {
      source: 'b7d8d2e8',
      sourceAnchor: 1,
      target: 'abc38a04',
      targetAnchor: 0,
      id: '4e629fb9',
      index: 8,
    },
    {
      source: '0c3fa4e0',
      sourceAnchor: 1,
      target: 'abc38a04',
      targetAnchor: 0,
      id: 'baae7224',
      index: 9,
    },
    {
      source: '5a3fab60',
      sourceAnchor: 3,
      target: '08c7cc36',
      targetAnchor: 3,
      id: '34b558f0',
      label: '是',
      index: 10,
    },
    {
      source: '5a3fab60',
      sourceAnchor: 1,
      target: 'adf72bb1',
      targetAnchor: 0,
      id: '54970276',
      label: '否',
      index: 12,
    },
    {
      source: 'abc38a04',
      sourceAnchor: 1,
      target: '5a6e9501',
      targetAnchor: 0,
      id: '88d51eaa',
      index: 14,
    },
    {
      source: '5a6e9501',
      sourceAnchor: 3,
      target: '8739ded2',
      targetAnchor: 0,
      id: 'd6bad022',
      label: '是',
      index: 15,
    },
    {
      source: '5a6e9501',
      sourceAnchor: 1,
      target: 'd58ed90d',
      targetAnchor: 0,
      id: 'eb7e5e9b',
      label: '否',
      index: 16,
    },
    {
      source: 'd58ed90d',
      sourceAnchor: 3,
      target: '88d30000',
      targetAnchor: 2,
      id: '87877684',
      index: 17,
    },
    {
      source: '8739ded2',
      sourceAnchor: 3,
      target: '88d30000',
      targetAnchor: 0,
      id: 'e14e736b',
      index: 18,
    },
    {
      source: '88d30000',
      sourceAnchor: 3,
      target: '5a3fab60',
      targetAnchor: 2,
      id: '4478d418',
      index: 19,
    },
  ],
};

const graphDataMapObj = {
  '08c7cc36': {
    shape: 'processblock',
    properties: [
      { cnName: '标签名称', enName: 'label', value: '流程块', default: '' },
      { cnName: '输入参数', enName: 'param', value: [], default: '' },
      { cnName: '流程块返回', enName: 'output', value: [], default: '' },
    ],
    variable: [],
  },
  a40cba67: {
    shape: 'rhombus-node',
    properties: [
      { cnName: '标签名称', enName: 'label', value: '判断', default: '' },
      {
        cnName: '分支条件',
        enName: 'condition',
        value: '',
        default: '',
        valueMapping: [
          { name: '等于', value: '==' },
          { name: '不等于', value: '!=' },
          { name: '大于', value: '>' },
          { name: '小于', value: '<' },
          { name: '大于等于', value: '>=' },
          { name: '小于等于', value: '<=' },
          { name: '空', value: 'is None' },
          { name: '非空', value: 'not None' },
        ],
        tag: 1,
        valueList: [],
      },
    ],
  },
  '5a3fab60': {
    shape: 'rhombus-node',
    properties: [
      { cnName: '标签名称', enName: 'label', value: '判断', default: '' },
      {
        cnName: '分支条件',
        enName: 'condition',
        value: '',
        default: '',
        valueMapping: [
          { name: '等于', value: '==' },
          { name: '不等于', value: '!=' },
          { name: '大于', value: '>' },
          { name: '小于', value: '<' },
          { name: '大于等于', value: '>=' },
          { name: '小于等于', value: '<=' },
          { name: '空', value: 'is None' },
          { name: '非空', value: 'not None' },
        ],
        tag: 1,
        valueList: [],
      },
    ],
  },
  '0c3fa4e0': {
    shape: 'processblock',
    properties: [
      { cnName: '标签名称', enName: 'label', value: '流程块', default: '' },
      { cnName: '输入参数', enName: 'param', value: [], default: '' },
      { cnName: '流程块返回', enName: 'output', value: [], default: '' },
    ],
    variable: [],
  },
  b7d8d2e8: {
    shape: 'processblock',
    properties: [
      { cnName: '标签名称', enName: 'label', value: '流程块', default: '' },
      { cnName: '输入参数', enName: 'param', value: [], default: '' },
      { cnName: '流程块返回', enName: 'output', value: [], default: '' },
    ],
    variable: [],
  },
  abc38a04: {
    shape: 'processblock',
    properties: [
      { cnName: '标签名称', enName: 'label', value: '流程块', default: '' },
      { cnName: '输入参数', enName: 'param', value: [], default: '' },
      { cnName: '流程块返回', enName: 'output', value: [], default: '' },
    ],
    variable: [],
  },
  adf72bb1: { shape: 'end-node', properties: [] },
  '5a6e9501': {
    shape: 'rhombus-node',
    properties: [
      { cnName: '标签名称', enName: 'label', value: '判断', default: '' },
      {
        cnName: '分支条件',
        enName: 'condition',
        value: '',
        default: '',
        valueMapping: [
          { name: '等于', value: '==' },
          { name: '不等于', value: '!=' },
          { name: '大于', value: '>' },
          { name: '小于', value: '<' },
          { name: '大于等于', value: '>=' },
          { name: '小于等于', value: '<=' },
          { name: '空', value: 'is None' },
          { name: '非空', value: 'not None' },
        ],
        tag: 1,
        valueList: [],
      },
    ],
  },
  '8739ded2': {
    shape: 'processblock',
    properties: [
      { cnName: '标签名称', enName: 'label', value: '流程块', default: '' },
      { cnName: '输入参数', enName: 'param', value: [], default: '' },
      { cnName: '流程块返回', enName: 'output', value: [], default: '' },
    ],
    variable: [],
  },
  d58ed90d: {
    shape: 'processblock',
    properties: [
      { cnName: '标签名称', enName: 'label', value: '流程块', default: '' },
      { cnName: '输入参数', enName: 'param', value: [], default: '' },
      { cnName: '流程块返回', enName: 'output', value: [], default: '' },
    ],
    variable: [],
  },
  '88d30000': {
    shape: 'processblock',
    properties: [
      { cnName: '标签名称', enName: 'label', value: '流程块', default: '' },
      { cnName: '输入参数', enName: 'param', value: [], default: '' },
      { cnName: '流程块返回', enName: 'output', value: [], default: '' },
    ],
    variable: [],
  },
};

const graphDataMap = new Map();

for (const [key, item] of Object.entries(graphDataMapObj)) {
  graphDataMap.set(key, item);
}

describe('test RPA', () => {
  it('test basic transform', () => {
    const Component = function ({ graphData, graphDataMap }) {
      return <div>{transformGGEditor(graphData, graphDataMap)}</div>;
    };

    const Rpa = (
      <div>
        <Component graphData={graphData} graphDataMap={graphDataMap} />
      </div>
    );

    expect(renderer.create(Rpa).toJSON()).toMatchSnapshot();
  });
});
