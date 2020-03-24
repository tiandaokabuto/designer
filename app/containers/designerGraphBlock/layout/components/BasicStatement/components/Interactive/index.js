import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';

// import InteractiveWrapper from './components/InteractiveWrapper';
import InteractiveEditor from './layout/InteractiveEditor';
import WidgetPanel from './layout/WidgetPanel';

import { generateLastPosition } from './utils';

import './index.scss';

export default ({ visible, setVisible, interactiveCard }) => {
  const [layout, setLayout] = useState(interactiveCard.layout);
  const onAddControl = item => {
    console.log('add control', item);
    setLayout(layout => ({
      ...layout,
      data: layout.data.concat({
        i: 'a' + Math.random(0, 100),
        w: 1,
        h: 1,
        ...generateLastPosition(layout.data),
      }),
    }));
  };

  const handleLayoutChange = data => {
    console.log(data);
    setLayout(layout => ({
      ...layout,
      data: data,
    }));
    // setLayout(layout1);
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
          <InteractiveEditor
            layout={layout}
            handleLayoutChange={handleLayoutChange}
          />
        </div>
        <div className="interactive-parampanel"></div>
      </div>
    </Modal>
  );
};
