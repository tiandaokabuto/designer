import React from 'react';
import { Input } from 'antd';
import { useSelector } from 'react-redux';
import { withPropsAPI } from 'gg-editor';

const FormItem = ({ param, propsAPI }) => {
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
                param.value = e.target.value;
                const { getSelected, executeCommand, update } = propsAPI;
                const item = getSelected()[0];
                const { label } = item.getModel();
                if (!item) {
                  return;
                }
                executeCommand(
                  update(item, {
                    label: e.target.value,
                  })
                );
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
        return <FormItem param={param} key={index} propsAPI={propsAPI} />;
      })}
    </div>
  );
});
