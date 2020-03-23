import React from 'react';
import styled from 'styled-components';

import InteractiveWrapper from '../../components/InteractiveWrapper';

const InteractiveContainer = styled.div`
  display: grid;
  height: 100%;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr;
`;

export default () => {
  return (
    <div className="interactive-container-layout">
      <InteractiveContainer>
        <InteractiveWrapper />
      </InteractiveContainer>
    </div>
  );
};
