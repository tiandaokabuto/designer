import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'antd';
import cloneDeep from 'lodash/cloneDeep';

import InteractiveEditor from './layout/InteractiveEditor';
import WidgetPanel from './layout/WidgetPanel';
import InteractiveParampanel from './layout/InteractiveParampanel';

import { generateLastPosition, getUniqueId } from './utils';
import { useNoticyBlockCodeChange } from '../../../../useHooks';

import './index.scss';

export default ({ visible, setVisible, interactiveCard, saveLayoutChange }) => {
  const [layout, setLayout] = useState(interactiveCard.layout);
  const [checkedGridItemId, setCheckedGridItemId] = useState({});

  const [isPreview, setIsPreview] = useState(false);

  const INITIAL_WIDTH = {
    input: layout && (layout.cols || 4),
    image: 1,
    'submit-btn': 1,
    'cancel-btn': 1,
    'file-upload': layout && (layout.cols || 4),
  };

  const INITIAL_HEIGHT = {
    input: 1,
    image: 3,
    'submit-btn': 1,
    'cancel-btn': 1,
    'file-upload': 1,
  };

  const noticyChange = useNoticyBlockCodeChange();

  const onAddControl = item => {
    setLayout(layout => {
      const i = getUniqueId(layout.data);
      if (!item.preset) {
        const lastItem = layout.data.pop();
        const newData = layout.data.concat([
          {
            i: i,
            w: INITIAL_WIDTH[item.type],
            h: INITIAL_HEIGHT[item.type],
            ...generateLastPosition(layout.data),
          },
          lastItem,
        ]);

        return {
          ...layout,
          dataMap: {
            ...layout.dataMap,
            [i]: cloneDeep(item),
          },
          data: newData,
        };
      }
      return {
        ...layout,
        dataMap: {
          ...layout.dataMap,
          [i + 'preset']: cloneDeep(item),
        },
        data: layout.data.concat({
          i: i + 'preset',
          w: INITIAL_WIDTH[item.type],
          h: INITIAL_HEIGHT[item.type],
          ...generateLastPosition(layout.data),
        }),
      };
    });
  };

  const popLayoutData = () => {
    setLayout(layout => {
      const lastItem = layout.data.pop();
      const newData = [...layout.data];
      const i = lastItem.i;
      return {
        ...layout,
        data: newData,
        dataMap: {
          ...layout.dataMap,
          [i]: undefined,
        },
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

  const handleControlDelete = i => {
    setLayout(layout => ({
      ...layout,
      data: layout.data.filter(item => item.i !== i),
      dataMap: !(layout.dataMap[i] = undefined) && layout.dataMap,
    }));
  };

  const handleProview = isStatic => {
    setLayout(layout => ({
      ...layout,
      data: layout.data.map(item => ({ ...item, static: isStatic })),
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
      footer={
        <div>
          <Button
            onClick={() => {
              setVisible(false);
            }}
          >
            取消
          </Button>
          <Button
            onClick={() => {
              handleProview(!isPreview);
              setIsPreview(preview => !preview);
            }}
          >
            {isPreview ? '取消预览' : '预览'}
          </Button>
          <Button
            type="primary"
            onClick={() => {
              if (layout) {
                saveLayoutChange(layout);
              }
              setVisible(false);
            }}
          >
            确定
          </Button>
        </div>
      }
    >
      <div className="interactive">
        {!isPreview && (
          <div className="interactive-item">
            <WidgetPanel
              onAddControl={onAddControl}
              setCheckedGridItemId={setCheckedGridItemId}
              popLayoutData={popLayoutData}
            />
          </div>
        )}
        <div className="interactive-container">
          <InteractiveEditor
            layout={layout}
            isPreview={isPreview}
            setCheckedGridItemId={setCheckedGridItemId}
            handleLayoutChange={handleLayoutChange}
            handleControlDelete={handleControlDelete}
          />
        </div>
        {!isPreview && (
          <div className="interactive-parampanel">
            <div className="interactive-parampanel-title">参数面板</div>
            <InteractiveParampanel
              handleLabelChange={handleLabelChange}
              checkedGridItemId={checkedGridItemId}
              handleLayoutColChange={handleLayoutColChange}
              layout={layout}
            />
          </div>
        )}
      </div>
    </Modal>
  );
};
