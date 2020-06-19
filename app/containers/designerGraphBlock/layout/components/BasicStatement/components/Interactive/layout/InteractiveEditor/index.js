import React, { useEffect, useLayoutEffect } from 'react';
import GridLayout from 'react-grid-layout';

import InteractiveWrapper from '../components/InteractiveWrapper';
import { useGetDomWidth } from '../../useHooks';

import BasicInputComponent from './components/BasicInputComponent';
import ImageComponent from './components/ImageComponent';
import BasicButton from './components/BasicButton';
import FileUpload from './components/FileUpload';
import FileDownload from './components/FileDownload';
import DropDown from './components/DropDown';

import { isLocked } from '../WidgetPanel';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

export default ({
  layout: { data, dataMap = {}, cols = 4 },
  isPreview,
  handleLayoutChange,
  setCheckedGridItemId,
  handleControlDelete,
}) => {
  const [ref, width] = useGetDomWidth(isPreview);

  const generateComponent = (desc, gridItem) => {
    switch (desc.type) {
      case 'input':
        return <BasicInputComponent desc={desc} i={gridItem.i} />;
      case 'image':
        return <ImageComponent desc={desc} i={gridItem.i} />;
      case 'submit-btn':
        return <BasicButton type="primary" desc={desc} i={gridItem.i} />;
      case 'cancel-btn':
        return <BasicButton desc={desc} i={gridItem.i} />;
      case 'file-upload':
        return <FileUpload desc={desc} i={gridItem.i} />;
      case 'file-download':
        return <FileDownload desc={desc} i={gridItem.i} />;
      case 'drop-down':
        return <DropDown desc={desc} i={gridItem.i} />;
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
  }, []);

  useLayoutEffect(() => {
    if (data.length) {
      const lastItem = data.slice(-1);

      if (isLocked && lastItem[0].i.includes('preset')) {
        // 滚动条下滑到底
        const layoutDom = document.querySelector('.interactive-placeholder');
        if (!layoutDom) return;
        layoutDom.scrollIntoView({
          behavior: 'smooth',
        });
      }
    }
  }, [data, isLocked]);

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
        margin={[16, 16]}
        cols={cols}
      >
        {(data || []).map(gridItem => (
          <div key={gridItem.i}>
            <InteractiveWrapper
              gridItem={gridItem}
              isPreview={isPreview}
              handleControlDelete={handleControlDelete}
              text={dataMap[gridItem.i].label}
            >
              {generateComponent(dataMap[gridItem.i], gridItem)}
            </InteractiveWrapper>
          </div>
        ))}
      </GridLayout>
    </div>
  );
};
