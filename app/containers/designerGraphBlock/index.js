import React from 'react';
import { DndProvider } from 'react-dnd';
import Backend from 'react-dnd-html5-backend';
import { useInjectContext } from 'react-hook-easier/lib/useInjectContext';

import DragContainer from './layout/DragContainer';
import DragItem from './layout/DragItem';
import DragParamPanel from './layout/DragParamPanel';

import { transformBlockToCode } from './RPAcore';
import { writeFile } from '../../nodejs';

import './index.scss';

export default useInjectContext(({ history }) => {
  const transformToPython = data => {
    const result = transformBlockToCode(data);
    console.log(result);
    writeFile(
      __dirname + '/containers/designerGraphBlock/python/test.py',
      result.output
    );
  };
  return (
    <DndProvider backend={Backend}>
      <div className="dragger-editor">
        <div
          style={{
            position: 'absolute',
            top: 0,
          }}
          onClick={() => {
            history.push('/');
          }}
        >
          返回
        </div>
        <DragItem />
        <DragContainer transformToPython={transformToPython} />
        <DragParamPanel />
      </div>
    </DndProvider>
  );
});
