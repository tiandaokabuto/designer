import React from 'react';
import { DndProvider } from 'react-dnd';
import Backend from 'react-dnd-html5-backend';
import { useInjectContext } from 'react-hook-easier/lib/useInjectContext';

import GraphBlockHeader from '../common/GraphBlockHeader';
import DragEditorHeader from '../common/DragEditorHeader';
import DragContainer from './layout/DragContainer';
import DragItem from './layout/DragItem';
import DragParamPanel from './layout/DragParamPanel';
import SyncAutomicList from './layout/DragItem/components/SyncAutomicList';

import { writeFile } from '../../nodejs';

import './index.scss';

export default useInjectContext(({ history }) => {
  return (
    <DndProvider backend={Backend}>
      <GraphBlockHeader />
      <DragEditorHeader type="block" />
      <div className="dragger-editor">
        {/* <div
          style={{
            position: 'absolute',
            top: 0,
          }}
          onClick={() => {
            history.push('/');
          }}
        >
          返回
        </div> */}
        <DragItem />
        <DragContainer />
        <DragParamPanel />
      </div>
      <SyncAutomicList />
    </DndProvider>
  );
});
