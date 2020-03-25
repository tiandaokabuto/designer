import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';
import cloneDeep from 'lodash/cloneDeep';

import InteractiveEditor from './layout/InteractiveEditor';
import WidgetPanel from './layout/WidgetPanel';
import InteractiveParampanel from './layout/InteractiveParampanel';

import { generateLastPosition } from './utils';
import { useNoticyBlockCodeChange } from '../../../../useHooks';

import './index.scss';

export default ({ visible, setVisible, interactiveCard, saveLayoutChange }) => {
  const [layout, setLayout] = useState(interactiveCard.layout);
  const [checkedGridItemId, setCheckedGridItemId] = useState({});

  const INITIAL_WIDTH = {
    input: layout && (layout.cols || 4),
    image: layout && (layout.cols < 4 ? 4 : layout.cols) / 4,
    'submit-btn': 1,
    'cancel-btn': 1,
  };

  const noticyChange = useNoticyBlockCodeChange();

  const onAddControl = item => {
    console.log(INITIAL_WIDTH);
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
          w: INITIAL_WIDTH[item.type],
          h: 2,
          ...generateLastPosition(layout.data),
        }),
      };
    });
  };

  const handleLayoutColChange = value => {
    setLayout(layout => ({
      ...layout,
      cols: Number(value),
    }));
  };

  const handleLabelChange = () => {
    setLayout(layout => ({
      ...layout,
      dataMap: { ...layout.dataMap },
    }));
  };

  const handleLayoutChange = data => {
    noticyChange();
    setLayout(layout => ({
      ...layout,
      data: data,
    }));
  };

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
        if (layout) {
          saveLayoutChange(layout);
        }
        setVisible(false);
      }}
    >
      <div className="interactive">
        <div className="interactive-item">
          <WidgetPanel
            onAddControl={onAddControl}
            setCheckedGridItemId={setCheckedGridItemId}
          />
        </div>
        <div className="interactive-container">
          <InteractiveEditor
            layout={layout}
            setCheckedGridItemId={setCheckedGridItemId}
            handleLayoutChange={handleLayoutChange}
          />
        </div>
        <div className="interactive-parampanel">
          <div className="interactive-parampanel-title">参数面板</div>
          <InteractiveParampanel
            handleLabelChange={handleLabelChange}
            checkedGridItemId={checkedGridItemId}
            handleLayoutColChange={handleLayoutColChange}
            layout={layout}
          />
        </div>
      </div>
    </Modal>
  );
};
