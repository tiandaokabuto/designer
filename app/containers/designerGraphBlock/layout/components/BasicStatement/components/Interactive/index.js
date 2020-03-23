import React from 'react';
import { Modal } from 'antd';
import { DndProvider } from 'react-dnd';
import Backend from 'react-dnd-html5-backend';

import InteractiveControl from './components/InteractiveControl';
import InteractiveWrapper from './components/InteractiveWrapper';

import './index.scss';

export default ({ visible, setVisible }) => {
  return (
    <DndProvider Backend={Backend}>
      <Modal
        visible={visible}
        width="80%"
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
            <InteractiveControl item={{ type1: 'input' }} />
          </div>
          <div className="interactive-container">
            <div className="interactive-container-layout">
              <InteractiveWrapper />
            </div>
          </div>
        </div>
      </Modal>
    </DndProvider>
  );
};
