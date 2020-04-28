import React, { useEffect } from 'react';
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

const remote = require('electron').remote;
const electronLocalshortcut = require('electron-localshortcut');

export default useInjectContext(({ history }) => {
  // useEffect(() => {
  //   const win = remote.getCurrentWindow();
  //   if (!win || !win.webContents) return;
  //   electronLocalshortcut.register(win, 'ctrl+c', () => {
  //     console.log('You pressed ctrl & c');
  //   });
  //   return () => {
  //     electronLocalshortcut.unregisterAll();
  //   };
  // }, []);
  return (
    <DndProvider backend={Backend}>
      <GraphBlockHeader history={history} />
      <DragEditorHeader type="block" />
      <div className="dragger-editor">
        <DragItem />
        <DragContainer />
        <DragParamPanel />
      </div>
      <SyncAutomicList />
    </DndProvider>
  );
});
