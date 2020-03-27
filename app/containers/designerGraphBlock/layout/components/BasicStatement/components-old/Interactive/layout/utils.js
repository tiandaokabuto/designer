import React from 'react';

import InteractiveWrapper from '../components/InteractiveWrapper';
import PlacehoderComponent from '../components/PlacehoderComponent';
export const placeWrapperChild = (placeList = []) => {
  return placeList.map((place, index) => (
    <InteractiveWrapper key={index}>
      <PlacehoderComponent />
    </InteractiveWrapper>
  ));
};
