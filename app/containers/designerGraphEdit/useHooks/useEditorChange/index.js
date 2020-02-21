import React from 'react';
import { withPropsAPI } from 'gg-editor';

import EdgeHandler from './EdgeHanlder';
import NodeHandler from './NodeHandler';

const handlerMap = new Map();

class RegistryCenterImpl extends React.Component {
  static registerDataChange(change) {
    // 监听到边添加的事件,委托给对应的类处理
    switch (change.item && change.item.type) {
      case 'edge':
        handlerMap.get('EdgeHandler').handleEdgeChange(change);
      case 'node':
        handlerMap.get('NodeHandler').handleNodeChange(change);
      default:
      // do nothing
    }
  }

  componentDidMount() {
    const { propsAPI } = this.props;
    handlerMap.set('EdgeHandler', new EdgeHandler(propsAPI));
    handlerMap.set('NodeHandler', new NodeHandler(propsAPI));
  }

  render() {
    return null;
  }
}

export const registerDataChange = RegistryCenterImpl.registerDataChange;

export default withPropsAPI(RegistryCenterImpl);
