import React, { useState, Fragment } from 'react';
import { Input, Radio, Select, Icon } from 'antd';
import { withPropsAPI } from 'gg-editor';
import useDebounce from 'react-hook-easier/lib/useDebounce';

import VariablePanel from './VariablePanel';
import { useNoticyBlockCodeChange } from '../../../../designerGraphBlock/layout/useHooks';
import event from '../../../../designerGraphBlock/layout/eventCenter';

import {
  updateGraphData,
  synchroGraphDataToProcessTree,
  changeCheckedGraphBlockId,
} from '../../../../reduxActions';

const { Option } = Select;

const FormItem = ({
  param,
  propsAPI,
  checkedGraphBlockId,
  noticyBlockCodeChange,
  graphDataMap,
  graphData,
  setFlag,
}) => {
  const ifItem = graphDataMap.get(checkedGraphBlockId).properties[1];

  const [tag, setTag] = useState(ifItem.tag);

  const forceUpdate = () => {
    setFlag(true);
    setTimeout(() => {
      setFlag(false);
    }, 50);
  };

  const handleAdd = () => {
    if (ifItem.valueList) {
      ifItem.valueList.push({
        v1: '',
        v2: '',
        rule: '',
        connect: '',
      });
      forceUpdate();
    }
  };

  const handleDelete = index => {
    ifItem.valueList.splice(index, 1);
    forceUpdate();
  };

  const { executeCommand, update, save, find } = propsAPI;
  const handleLableChange = useDebounce(e => {
    const item = find(checkedGraphBlockId);
    if (!item) {
      return;
    }
    // 流程块的最大文本长度
    let maxLength = 18;
    if (
      item.dataMap[item.id] &&
      item.dataMap[item.id].shape === 'rhombus-node'
    ) {
      // 判断块的最大文本长度
      maxLength = 9;
    }
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

  const handleLableChangeTwo = useDebounce(e => {
    const labelValue = e.target.value;
    param.value = labelValue;

    const node = graphData.nodes.find(item => item.id === checkedGraphBlockId);

    node.label = labelValue;

    event.emit('resetGraph');

    changeCheckedGraphBlockId(checkedGraphBlockId);

    setTimeout(() => {
      updateGraphData(graphData);
      synchroGraphDataToProcessTree();
    }, 0);
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
      {param.cnName === '分支条件' ? (
        ''
      ) : (
        <span style={{ flex: 1, whiteSpace: 'nowrap', marginRight: '8px' }}>
          {param.cnName}
        </span>
      )}

      {param.cnName === '分支条件' ? (
        <div>
          <Radio.Group
            style={{
              display: 'flex',
              marginBottom: '10px',
            }}
            onChange={e => {
              ifItem.tag = e.target.value;
              synchroGraphDataToProcessTree();
              noticyBlockCodeChange();
              setTag(e.target.value);
            }}
            defaultValue={ifItem.tag ? ifItem.tag : 2}
          >
            <Radio value={1}>向导模式</Radio>
            <Radio value={2}>自定义模式</Radio>
          </Radio.Group>
          {tag === 1 ? (
            <div className="condition-param">
              <div>
                <div className="condition-param-ifcondition">
                  <span>变量</span>
                  <span>规则</span>
                  <span>变量</span>
                  <span>
                    <Icon
                      type="plus"
                      className="condition-param-btn"
                      onClick={() => {
                        handleAdd();
                      }}
                    />
                  </span>
                </div>
                {(ifItem.valueList || []).map((item, index) => {
                  return (
                    <Fragment key={index}>
                      <div className="condition-param-ifcondition">
                        <Input
                          placeholder="输入文本"
                          defaultValue={item.v1}
                          onChange={e => {
                            item.v1 = e.target.value;
                            synchroGraphDataToProcessTree();
                            noticyBlockCodeChange();
                          }}
                        />
                        <Select
                          style={{ width: '100%' }}
                          defaultValue={item.rule}
                          dropdownMatchSelectWidth={false}
                          onChange={value => {
                            item.rule = value;
                            synchroGraphDataToProcessTree();
                            noticyBlockCodeChange();
                          }}
                        >
                          {(ifItem.valueMapping || []).map(ruleItem => (
                            <Option key={ruleItem.value} value={ruleItem.value}>
                              {ruleItem.name}
                            </Option>
                          ))}
                        </Select>
                        <Input
                          placeholder="输入"
                          defaultValue={item.v2}
                          onChange={e => {
                            item.v2 = e.target.value;
                            synchroGraphDataToProcessTree();
                            noticyBlockCodeChange();
                          }}
                        />
                        <Icon
                          type="delete"
                          className="condition-param-btn"
                          onClick={() => {
                            handleDelete(index);
                            synchroGraphDataToProcessTree();
                            noticyBlockCodeChange();
                          }}
                        />
                      </div>
                      <div className="condition-param-ifcondition">
                        <Radio.Group
                          defaultValue={item.connect}
                          onChange={e => {
                            item.connect = e.target.value;
                            synchroGraphDataToProcessTree();
                            noticyBlockCodeChange();
                          }}
                          style={{
                            display: 'flex',
                          }}
                        >
                          <Radio value="and">且</Radio>
                          <Radio value="or">或</Radio>
                        </Radio.Group>
                      </div>
                    </Fragment>
                  );
                })}
              </div>
            </div>
          ) : (
            <Input
              defaultValue={ifItem.value}
              onChange={e => {
                ifItem.value = e.target.value;
                synchroGraphDataToProcessTree();
                noticyBlockCodeChange();
              }}
            />
          )}
        </div>
      ) : (
        <Input
          defaultValue={param.value}
          onChange={
            param.enName === 'label'
              ? e => {
                  e.persist();
                  handleLableChangeTwo(e);
                  noticyBlockCodeChange();
                }
              : e => {
                  param.value = e.target.value;
                  setTimeout(() => {
                    updateGraphData(save());
                    synchroGraphDataToProcessTree();
                  }, 0);
                  noticyBlockCodeChange();
                }
          }
        />
      )}
    </div>
  );
};

export default withPropsAPI(
  ({ propsAPI, checkedGraphBlockId, graphDataMap, blockNode, graphData }) => {
    const noticyBlockCodeChange = useNoticyBlockCodeChange();
    const [flag, setFlag] = useState(false);

    return (
      <div key={checkedGraphBlockId}>
        {(blockNode.properties || []).map((param, index) => {
          if (param.enName === 'param') {
            return (
              <VariablePanel
                key={index}
                blockNode={{
                  variable: param.value,
                }}
                label="输入参数"
              />
            );
          }
          if (param.enName === 'output') {
            return (
              <VariablePanel
                key={index}
                blockNode={{
                  variable: param.value,
                }}
                label="输出参数"
              />
            );
          }

          return (
            <FormItem
              param={param}
              graphDataMap={graphDataMap}
              graphData={graphData}
              checkedGraphBlockId={checkedGraphBlockId}
              key={index}
              setFlag={setFlag}
              propsAPI={propsAPI}
              noticyBlockCodeChange={noticyBlockCodeChange}
            />
          );
        })}
      </div>
    );
  }
);
