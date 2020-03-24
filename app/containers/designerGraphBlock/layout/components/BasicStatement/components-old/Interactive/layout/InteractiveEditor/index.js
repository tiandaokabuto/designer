import React from 'react';
import styled from 'styled-components';
import { InjectProvider } from 'react-hook-easier/lib/useInjectContext';

import { placeWrapperChild } from '../utils';

const InteractiveContainer = styled.div`
  display: grid;
  height: 100%;
  grid-template-columns: ${({ column }) => `repeat(${column}, 1fr)`};
  grid-template-rows: ${({ row }) => `repeat(${row}, 1fr)`};
`;

export default ({ layout: { column, row } = { column: 2, row: 3 } }) => {
  return (
    <InjectProvider
      value={{
        onDrop: () => {
          console.log('drop触发');
        },
      }}
    >
      <div className="interactive-container-layout">
        <InteractiveContainer column={column} row={row}>
          {placeWrapperChild(Array.apply(null, { length: row * column }))}
        </InteractiveContainer>
      </div>
    </InjectProvider>
  );
};
