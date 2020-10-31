import React, { useMemo, memo } from 'react';
import { useSelector } from 'react-redux';
import useForceUpdate from 'react-hook-easier/lib/useForceUpdate';
import { Input } from 'antd';
import { cloneDeep } from 'lodash';

import './index.scss';

export default ({ output, handleEmitCodeTransform, markBlockIsUpdated }) => {
  const [flag, forceUpdate] = useForceUpdate();
  const graphDataMap = useSelector(state => state.grapheditor.graphDataMap);
  const checkedGraphBlockId = useSelector(
    state => state.grapheditor.checkedGraphBlockId
  );

  const returnList = graphDataMap.get(checkedGraphBlockId)
    ? graphDataMap
        .get(checkedGraphBlockId)
        .properties.find(item => item.enName === 'output').value || []
    : [];
  const newArr = [];
  const returnListLength = returnList.length;
  const outputLength = output.length;
  if (outputLength === 0) {
    // 初始化
    returnList.forEach((item, index) => {
      output.push({
        ...item,
        name: '',
      });
    });
  } else {
    if (
      returnListLength !== 0 &&
      output[outputLength - 1].id !== returnList[returnListLength - 1].id &&
      returnListLength !== outputLength
    ) {
      // returnList有新增的情况
      returnList.forEach((item, index) => {
        const iitem = output.find(iitem => item.id === iitem.id);
        if (!iitem) {
          output.push({
            ...item,
            name: '',
          });
        }
      });
    } else {
      output.forEach((item, index) => {
        const iitem = returnList.find(iitem => item.id === iitem.id);
        if (iitem) {
          item.value = iitem.value;
        } else {
          output.forEach((iiitem, iiindex) => {
            if (iiitem.id === item.id) {
              output.splice(index, 1);
            }
          });
          // output = output.filter(out => out.id !== item.id);
          // console.log(arr);
          // output = arr;
        }
      });

      // returnList.forEach((item, index) => {
      //   const iitem = output.find(iitem => item.id === iitem.id);
      //   if (iitem) {
      //     // 在output中存在
      //     iitem.value = item.value;
      //   } else {
      //     // 在output中不存在
      //     const arr = output.map(out => out.id !== item.id);
      //     console.log(arr);
      //     output = arr;
      //   }
      // });
    }
  }
  console.log(output);
  // returnList.forEach((item, index) => {
  //   const iitem = output.find(iitem => item.id === iitem.id);
  //   if (iitem) {
  //     // 在output里存在
  //     // 存在
  //   } else {
  //     // 不存在
  //     if (outputLength === 0) {
  //       // 首次进来
  //       output.push({
  //         ...item,
  //         name: '',
  //       });
  //     } else {
  //       // 当前item不存在，splice掉
  //       output.splice(index, 1);
  //     }
  //   }

  //   // if (output[index] === undefined) {
  //   //   output.push({
  //   //     ...item,
  //   //     name: '',
  //   //   });
  //   // } else {
  //   //   // iitem存在，证明没有被删掉，不存在则被删掉
  //   //   const iitem = output.find(iitem => item.id === iitem.id);
  //   //   newArr.push({
  //   //     id: item.id,
  //   //     value: item.value,
  //   //     // name:
  //   //   });

  //   //   // output[index].value = item.value;
  //   //   // output[index].name = item.name;
  //   // }
  // });
  // output = newArr;

  // output.length = returnList.length;

  // if (output.length !== returnList.length) {
  //   // TODO 发现新列表长度和旧列表不同

  //   // TODO 删掉差异那条数据

  //   // TODO 赋值新长度
  //   output.length = returnList.length;
  // }

  return (
    <div className="outputPanel">
      <div className="outputPanel-container">
        <span>返回值</span>
        <span>描述</span>
      </div>
      {output.map((item, index) => (
        <div key={index} className="outputPanel-container">
          <Input
            // key={item.name || '0'}
            defaultValue={item.name}
            onChange={e => {
              item.name = e.target.value;
              markBlockIsUpdated();
              handleEmitCodeTransform();
            }}
          />
          <span style={{ lineHeight: '32px' }}>{item.value}</span>
        </div>
      ))}
    </div>
  );
};
