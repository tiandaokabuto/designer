import { useState } from 'react';
import axios from 'axios';

import api, { config } from '../../../../api';

export default param => {
  console.log(param, 'param');
  const [missionDataSource, setMissionDataSource] = useState([]);
  if (!missionDataSource.length && param.enName === 'name') {
    console.log(param);
    axios
      .get(api('getControllerParam'))
      .then(res => res.data)
      .then(json => {
        if (~json.code) {
          setMissionDataSource((json.data || []).map(item => item.name));
        }
      })
      .catch(err => console.log(err));
  }
  return missionDataSource;
};
