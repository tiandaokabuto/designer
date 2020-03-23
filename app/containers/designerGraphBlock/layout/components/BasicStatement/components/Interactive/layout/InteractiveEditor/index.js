import React from 'react';
import styled from 'styled-components';
import { Input } from 'antd';

import InteractiveWrapper from '../../components/InteractiveWrapper';

const InteractiveContainer = styled.div`
  display: grid;
  height: 100%;
  grid-template-columns: ${({ column }) => `repeat(${column}, 1fr)`};
  grid-template-rows: ${({ row }) => `repeat(${row}, 1fr)`};
`;

export default ({ layout: { column, row } = { column: 2, row: 3 } }) => {
  return (
    <div className="interactive-container-layout">
      <InteractiveContainer column={column} row={row}>
        <InteractiveWrapper>
          <Input />
        </InteractiveWrapper>
      </InteractiveContainer>
    </div>
  );
};
