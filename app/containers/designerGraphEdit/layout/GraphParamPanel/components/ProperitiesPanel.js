import React from 'react';
import { Input } from 'antd';
import { withPropsAPI } from 'gg-editor';
import useDebounce from 'react-hook-easier/lib/useDebounce';

import VariablePanel from './VariablePanel';
import { useNoticyBlockCodeChange } from '../../../../designerGraphBlock/layout/useHooks';

import {
  updateGraphData,
  synchroGraphDataToProcessTree,
} from '../../../../reduxActions';

const FormItem = ({
  param,
  propsAPI,
  checkedGraphBlockId,
  noticyBlockCodeChange,
}) => {
  const handleLableChange = useDebounce(e => {
    const maxLength = 18;
    let lableValue = e.target.value;
    param.value = lableValue;
    const labelLength = lableValue.length;
    if (labelLength > maxLength / 2) {
      let stringLengthCount = 0;
      for (let i = 0; i < labelLength; i += 1) {
        if (/[^\x00-\xff]/.test(lableValue[i])) {
          stringLengthCount += 2;
        } else {
          stringLengthCount += 1;
        }
        if (stringLengthCount > maxLength) {
          let newLableValue = lableValue.substring(0, i);
          if (i < labelLength) {
            newLableValue += '...';
          }
          lableValue = newLableValue;
          break;
        }
      }
    }

    const { executeCommand, update, save, find } = propsAPI;
    const item = find(checkedGraphBlockId);
    if (!item) {
      return;
    }
    setTimeout(() => {
      updateGraphData(save());
      synchroGraphDataToProcessTree();
    }, 0);
    executeCommand(
      update(item, {
        label: lableValue,
      })
    );
  }, 333);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-evenly',
        padding: '4px 8px',
        alignItems: 'center',
      }}
    >
      <span style={{ flex: 1, whiteSpace: 'nowrap', marginRight: '8px' }}>
        {param.cnName}
      </span>
      <Input
        defaultValue={param.value}
        onChange={
          param.enName === 'label'
            ? e => {
                e.persist();
                handleLableChange(e);
                noticyBlockCodeChange();
              }
            : e => {
                param.value = e.target.value;
                noticyBlockCodeChange();
              }
        }
      />
    </div>
  );
};

export default withPropsAPI(
  ({ propsAPI, checkedGraphBlockId, graphDataMap, blockNode }) => {
    const noticyBlockCodeChange = useNoticyBlockCodeChange();

    return (
      <div key={checkedGraphBlockId}>
        {(blockNode.properties || []).map((param, index) => {
          if (param.enName === 'param') {
            return (
              <VariablePanel
                blockNode={{
                  variable: param.value,
                }}
                label="输入参数"
              />
            );
          }

          return (
            <FormItem
              param={param}
              checkedGraphBlockId={checkedGraphBlockId}
              key={index}
              propsAPI={propsAPI}
              noticyBlockCodeChange={noticyBlockCodeChange}
            />
          );
        })}
      </div>
    );
  }
);
