import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';

// import InteractiveWrapper from './components/InteractiveWrapper';
import InteractiveEditor from './layout/InteractiveEditor';
import WidgetPanel from './layout/WidgetPanel';

import './index.scss';

export default ({ visible, setVisible, interactiveCard }) => {
  const [layout, setLayout] = useState(interactiveCard.layout);
  const onAddControl = item => {
    console.log('add control', item);
    setLayout(layout => ({
      ...layout,
      data: [
        { i: 'a', x: 0, y: 1, w: 1, h: 2 },
        { i: 'b', x: 1, y: 0, w: 3, h: 2 },
        { i: 'c', x: 2, y: 0, w: 1, h: 2 },
      ],
    }));
  };

  useEffect(() => {
    interactiveCard.layout = layout;
  }, [layout]);
  return (
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
          <WidgetPanel onAddControl={onAddControl} />
        </div>
        <div className="interactive-container">
          <InteractiveEditor layout={layout} />
        </div>
        <div className="interactive-parampanel"></div>
      </div>
    </Modal>
  );
};
