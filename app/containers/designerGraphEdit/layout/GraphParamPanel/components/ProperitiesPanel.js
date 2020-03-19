import React from 'react';
import { Input } from 'antd';
import { useSelector } from 'react-redux';
import { withPropsAPI } from 'gg-editor';
import useDebounce from 'react-hook-easier/lib/useDebounce';

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
    const value = e.target.value;
    param.value = value;

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
        label: value,
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

<<<<<<< HEAD
    return (
      <div key={checkedGraphBlockId}>
        {(blockNode.properties || []).map((param, index) => {
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
=======
  const noticyBlockCodeChange = useNoticyBlockCodeChange();

  return (
    <div key={checkedGraphBlockId}>
      {(blockNode.properties || []).map((param, index) => {
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
});
>>>>>>> fix:继续完成判断流程块是否改变的逻辑
