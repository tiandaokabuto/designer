import React, { Fragment, useState, useEffect } from 'react';
import { Input } from 'antd';

import LoopParamPanel from '../LoopParamPanel/index';
import event from '../../../eventCenter';
import ConditionParam from '../ConditionParam';

export default ({
  param,
  loopSelect,
  handleEmitCodeTransform,
  cards,
  stopDeleteKeyDown,
  keyFlag,
  setFlag,
}) => {
  const [listKeyword, setListKeyword] = useState('');
  const [listArray, setListArray] = useState('');

  const [dictKey, setDictKey] = useState('');
  const [dictValue, setDictValue] = useState('');
  const [dict, setDict] = useState('');

  const [timesIndex, setTimesIndex] = useState('');
  const [timesStartIndex, setTimesStartIndex] = useState('');
  const [timesEndIndex, setTimesEndIndex] = useState('');
  const [timesStep, setTimesStep] = useState('');

  const handleForceUpdateLoop = select => {
    if (param.value) {
      if (select === 'for_list') {
        setListKeyword(param.value.substring(0, param.value.indexOf(' in ')));
        setListArray(param.value.substring(param.value.indexOf(' in ') + 4));
      } else if (select === 'for_dict') {
        setDictKey(param.value.match(/[^,]*/)[0]);
        setDictValue(param.value.match(/,([^\s]*)/)[1]);
        setDict(param.value.match(/in ([^\s]*)/)[1]);
      } else if (select === 'for_times') {
        setTimesIndex(param.value.match(/[^\s]*/)[0]);
        let range = param.value.match(/range\(([^\s]*)\)/);
        range = range ? range[1] : ',,';
        const rangeArray = range.split(',');
        setTimesStartIndex(rangeArray[0]);
        setTimesEndIndex(rangeArray[1]);
        setTimesStep(rangeArray[2]);
      }
    }
  };

  useEffect(() => {
    handleForceUpdateLoop(loopSelect);
    /*  event.addListener('forceUpdate', handleForceUpdateLoop);
    return () => {
      event.removeListener('forceUpdate', handleForceUpdateLoop);
    }; */
  }, []);

  useEffect(() => {
    if (loopSelect === 'for_list') {
      param.value = `${listKeyword} in ${listArray}`;
    } else if (loopSelect === 'for_dict') {
      param.value = `${dictKey},${dictValue} in ${dict}`;
    } else if (loopSelect === 'for_times') {
      param.value = `${timesIndex} in range(${timesStartIndex},${timesEndIndex},${timesStep})`;
    }
    handleEmitCodeTransform(cards);
  }, [
    listKeyword,
    listArray,
    dictKey,
    dictValue,
    dict,
    timesIndex,
    timesStartIndex,
    timesEndIndex,
    timesStep,
    loopSelect,
  ]);

  const composeParam = (value, setValueFun) => {
    setValueFun(value);
  };

  if (loopSelect === 'for_list') {
    return (
      <Fragment>
        <LoopParamPanel
          param={{ ...param, cnName: '值', value: listKeyword }}
          key="listKeyword"
          onChange={value => composeParam(value, setListKeyword)}
        />
        <LoopParamPanel
          param={{ ...param, cnName: '数组', value: listArray }}
          key="listArray"
          onChange={value => composeParam(value, setListArray)}
        />
      </Fragment>
    );
  } else if (loopSelect === 'for_dict') {
    return (
      <Fragment>
        <LoopParamPanel
          param={{ ...param, cnName: '键', value: dictKey }}
          key="dictKey"
          onChange={value => setDictKey(value)}
        />
        <LoopParamPanel
          param={{ ...param, cnName: '值', value: dictValue }}
          key="dictValue"
          onChange={value => setDictValue(value)}
        />
        <LoopParamPanel
          param={{ ...param, cnName: '字典', value: dict }}
          key="dict"
          onChange={value => setDict(value)}
        />
      </Fragment>
    );
  } else if (loopSelect === 'for_times') {
    return (
      <Fragment>
        <LoopParamPanel
          param={{ ...param, cnName: '索引名称', value: timesIndex }}
          key="timesIndex"
          onChange={value => setTimesIndex(value)}
        />
        <LoopParamPanel
          param={{ ...param, cnName: '初始值', value: timesStartIndex }}
          key="timesStartIndex"
          onChange={value => setTimesStartIndex(value)}
        />
        <LoopParamPanel
          param={{ ...param, cnName: '结束值', value: timesEndIndex }}
          key="timesEndIndex"
          onChange={value => setTimesEndIndex(value)}
        />
        <LoopParamPanel
          param={{ ...param, cnName: '每次增加', value: timesStep }}
          key="timesStep"
          onChange={value => setTimesStep(value)}
        />
      </Fragment>
    );
  } else if (loopSelect === 'for_condition') {
    return (
      <ConditionParam
        param={param}
        cards={cards}
        handleEmitCodeTransform={handleEmitCodeTransform}
        stopDeleteKeyDown={stopDeleteKeyDown}
        keyFlag={keyFlag}
        setFlag={setFlag}
      />
    );
  }
  return null;
};
