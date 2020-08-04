import React from 'react';
import { DndProvider } from 'react-dnd';
import Backend from 'react-dnd-html5-backend';

import ProcessBlock from '../../../../designerGraphBlock/DragContainer/ProcessBlock';

export default () => {
  return (
    <DndProvider backend={Backend}>
      <div className="dragger-editor-container">
        <ProcessBlock readOnly={true} />
      </div>
    </DndProvider>
  );
};
