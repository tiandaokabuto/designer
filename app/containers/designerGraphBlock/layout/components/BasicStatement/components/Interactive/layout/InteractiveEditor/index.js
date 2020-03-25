import React, { useEffect } from 'react';
import GridLayout from 'react-grid-layout';

import InteractiveWrapper from '../components/InteractiveWrapper';
import { useGetDomWidth } from '../../useHooks';

import BasicInputComponent from './components/BasicInputComponent';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

export default ({
  layout: { data, dataMap = {}, cols },
  handleLayoutChange,
  setCheckedGridItemId,
}) => {
  const [ref, width] = useGetDomWidth();

  const generateComponent = (desc, gridItem) => {
    switch (desc.type) {
      case 'input':
        return <BasicInputComponent desc={desc} i={gridItem.i} />;
      default:
        return 'other';
    }
  };

  // 监听元素点击事件
  useEffect(() => {
    const container = document.querySelector('.interactive-container-layout');
    if (!container) return;
    const handleDridItemClick = e => {
      if (e.target.dataset.id) {
        setCheckedGridItemId(e.target.dataset.id);
      }
    };
    container.addEventListener('click', handleDridItemClick);
    return () => {
      container.removeEventListener('click', handleDridItemClick);
    };
  }, [setCheckedGridItemId]);

  return (
    <div className="interactive-container-layout" ref={ref}>
      <GridLayout
        className="layout"
        draggableHandle=".interactive-handler"
        layout={data}
        onLayoutChange={handleLayoutChange}
        rowHeight={32}
        compactType="vertical"
        width={width}
        cols={3}
      >
        {(data || []).map(gridItem => (
          <div key={gridItem.i}>
            <InteractiveWrapper gridItem={gridItem}>
              {generateComponent(dataMap[gridItem.i], gridItem)}
            </InteractiveWrapper>
          </div>
        ))}
      </GridLayout>
    </div>
  );
};
