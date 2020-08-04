import React, { useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import Backend from 'react-dnd-html5-backend';
import { useInjectContext } from 'react-hook-easier/lib/useInjectContext';
import DragContainer from './layout/DragContainer';
import DragItem from './layout/DragItem';
import DragParamPanel from './layout/DragParamPanel';
import SyncAutomicList from './layout/DragItem/components/SyncAutomicList';

import { writeFile } from '../../nodejs';

import './index.scss';

export default useInjectContext(({ history }) => {
  useEffect(() => {
    window.getSelection().removeAllRanges();
  }, []);
  return (
    <DndProvider backend={Backend}>
      <div className="dragger-editor">
        <DragItem />
        <DragContainer />
        <DragParamPanel />
      </div>
      <SyncAutomicList />
    </DndProvider>
  );
});
