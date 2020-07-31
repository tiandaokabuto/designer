import { useState } from 'react';
import axios from 'axios';

import api, { config } from '../../../../api';

export default param => {
  const [missionDataSource, setMissionDataSource] = useState([]);
  if (!missionDataSource.length && param.enName === 'name') {
    axios
      .get(api('getControllerParam'))
      .then(res => res.data)
      .then(json => {
        if (json.data.length > 0) {
          setMissionDataSource((json.data || []).map(item => item.name));
        }
        return true;
      })
      .catch(err => console.log(err));
  } else if (!missionDataSource.length && param.enName === 'taskDataName') {
    axios
      .get(api('taskDataNames'))
      .then(res => {
        // console.log(res);
        return res ? res.data : { code: -1 };
      })
      .then(json => {
        if (~json.code) {
          setMissionDataSource(json.data || []);
          return true;
        }
        return false;
      })
      .catch(err => console.log(err));
  }
  return [missionDataSource];
};
