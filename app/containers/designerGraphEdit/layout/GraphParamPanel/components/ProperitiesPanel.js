import React from 'react';
import { Input } from 'antd';
import { useSelector } from 'react-redux';
import { withPropsAPI } from 'gg-editor';
import useDebounce from 'react-hook-easier/lib/useDebounce';

import {
  updateGraphData,
  synchroGraphDataToProcessTree,
} from '../../../../reduxActions';

const FormItem = ({ param, propsAPI, checkedGraphBlockId }) => {
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
              }
            : e => {
                param.value = e.target.value;
              }
        }
      />
    </div>
  );
};

export default withPropsAPI(({ propsAPI }) => {
  const checkedGraphBlockId = useSelector(
    state => state.grapheditor.checkedGraphBlockId
  );
  const graphDataMap = useSelector(state => state.grapheditor.graphDataMap);

  const blockNode = graphDataMap.get(checkedGraphBlockId) || {};

  return (
    <div key={checkedGraphBlockId}>
      {(blockNode.properties || []).map((param, index) => {
        return (
          <FormItem
            param={param}
            checkedGraphBlockId={checkedGraphBlockId}
            key={index}
            propsAPI={propsAPI}
          />
        );
      })}
    </div>
  );
});
