import React, { useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import Backend from 'react-dnd-html5-backend';
import { useInjectContext } from 'react-hook-easier/lib/useInjectContext';
import DragContainer from './DragContainer';
import DragItem from './DragItem';
import DragParamPanel from './DragParamPanel';
import SyncAutomicList from './DragItem/components/SyncAutomicList';

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
