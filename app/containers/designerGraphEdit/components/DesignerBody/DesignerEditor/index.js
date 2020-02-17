import React from 'react';
import { Row, Col, Button } from 'antd';
import GGEditor, { Flow, RegisterNode } from 'gg-editor';

import FlowToolbar from './components/EditorToolbar/FlowToolbar';
import FlowItemPanel from './components/EditorItemPanel/FlowItemPanel';
import FlowDetailPanel from './components/EditorDetailPanel/FlowDetailPanel';
import EditorMinimap from './components/EditorMinimap';
import FlowContextMenu from './components/EditorContextMenu/FlowContextMenu';
import CustomCommand from './command/CustomCommand';

export default () => {
  return (
    <div className="designergraph-body-editor">
      <GGEditor className="editor">
        <Row type="flex" className="editor-Hd">
          <Col span={24}>
            <FlowToolbar />
          </Col>
        </Row>
        <Row type="flex" className="editor-Bd">
          <Col span={4} className="editor-sidebar">
            <FlowItemPanel />
          </Col>
          <Col span={16} className="editor-content">
            <Flow
              className="editor-flow"
              onAfterChange={value => {
                // registerDataChange(value);
              }}
              noEndEdge={false}
              data={{
                nodes: [
                  {
                    type: 'node',
                    size: '100*100',
                    shape: 'custom-node',
                    color: '#FA8C16',
                    label: 'Ant Design',
                    labelOffsetY: 20,
                    icon:
                      '//img.alicdn.com/tfs/TB1gXH2ywHqK1RjSZFPXXcwapXa-200-200.svg',
                    x: 100,
                    y: 100,
                    id: 'ea1184e8',
                    index: 0,
                  },
                  {
                    type: 'node',
                    size: '100*100',
                    shape: 'custom-node',
                    color: '#FA8C16',
                    label: 'React',
                    labelOffsetY: 20,
                    icon:
                      '//img.alicdn.com/tfs/TB1OzAmyyLaK1RjSZFxXXamPFXa-200-200.svg',
                    x: 100,
                    y: 300,
                    id: '481fbb1a',
                    index: 2,
                  },
                ],
                edges: [
                  {
                    source: 'ea1184e8',
                    sourceAnchor: 1,
                    target: '481fbb1a',
                    targetAnchor: 0,
                    id: '7989ac70',
                    index: 1,
                  },
                ],
              }}
            />
          </Col>
          <Col span={4} className="editor-sidebar">
            <FlowDetailPanel />
            <EditorMinimap />
          </Col>
        </Row>
        <FlowContextMenu />
        <CustomCommand />
      </GGEditor>
    </div>
  );
};
