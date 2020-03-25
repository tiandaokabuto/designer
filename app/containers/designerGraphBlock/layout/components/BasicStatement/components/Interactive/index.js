import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';
import cloneDeep from 'lodash/cloneDeep';

import InteractiveEditor from './layout/InteractiveEditor';
import WidgetPanel from './layout/WidgetPanel';
import InteractiveParampanel from './layout/InteractiveParampanel';

import { generateLastPosition } from './utils';

import './index.scss';

export default ({ visible, setVisible, interactiveCard }) => {
  const [layout, setLayout] = useState(interactiveCard.layout);
  const [checkedGridItemId, setCheckedGridItemId] = useState({});
  const onAddControl = item => {
    setLayout(layout => {
      const i = 'a' + Math.random(0, 100);
      return {
        ...layout,
        dataMap: {
          ...layout.dataMap,
          [i]: cloneDeep(item),
        },
        data: layout.data.concat({
          i: i,
          w: 1,
          h: 2,
          ...generateLastPosition(layout.data),
        }),
      };
    });
  };

  const handleLabelChange = () => {
    setLayout(layout => ({
      ...layout,
      dataMap: { ...layout.dataMap },
    }));
  };

  const handleLayoutChange = data => {
    setLayout(layout => ({
      ...layout,
      data: data,
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
      onOk={() => {
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
            setCheckedGridItemId={setCheckedGridItemId}
            handleLayoutChange={handleLayoutChange}
          />
        </div>
        <div className="interactive-parampanel">
          <InteractiveParampanel
            handleLabelChange={handleLabelChange}
            checkedGridItemId={checkedGridItemId}
            layout={layout}
          />
        </div>
      </div>
    </Modal>
  );
};
