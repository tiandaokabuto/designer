import React from 'react';
import { Modal } from 'antd';
import { DndProvider } from 'react-dnd';
import Backend from 'react-dnd-html5-backend';

import InteractiveWrapper from './components/InteractiveWrapper';
import InteractiveEditor from './layout/InteractiveEditor';
import WidgetPanel from './layout/WidgetPanel';

import './index.scss';

export default ({ visible, setVisible }) => {
  return (
    <DndProvider Backend={Backend}>
      <Modal
        visible={visible}
        width="90%"
        bodyStyle={{
          height: '80vh',
        }}
        centered
        closable={false}
        maskClosable={false}
        onCancel={() => {
          setVisible(false);
        }}
      >
        <div className="interactive">
          <div className="interactive-item">
            <WidgetPanel />
          </div>
          <div className="interactive-container">
            <InteractiveEditor />
          </div>
          <div className="interactive-parampanel"></div>
        </div>
      </Modal>
    </DndProvider>
  );
};
