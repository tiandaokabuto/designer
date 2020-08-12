import React, { useState, Fragment, useEffect } from 'react';
import { Input, Radio, Select, Icon } from 'antd';
import { withPropsAPI } from 'gg-editor';
import useDebounce from 'react-hook-easier/lib/useDebounce';

import mxgraph from '../../../designerGraphEdit/MxGraph/mxgraph';
import VariablePanel from './VariablePanel';
import { useNoticyBlockCodeChange } from '../../../designerGraphBlock/useHooks';
import event from '@/containers/eventCenter';
import { translateGroup } from '_utils/RPACoreUtils/GraphEdit/utils';
import {
  updateGraphData,
  synchroGraphDataToProcessTree,
  changeCheckedGraphBlockId,
} from '../../../reduxActions';

const { Option } = Select;

const { mxEvent } = mxgraph;

const SelectContext = React.createContext({
  loopSelect: 'for_list',
  setLoopSelect: () => {},
});

const FormItem = ({
  param,
  propsAPI,
  checkedGraphBlockId,
  noticyBlockCodeChange,
  graphDataMap,
  graphData,
  setFlag,
}) => {
  const [translateTag, setTranslateTag] = useState(0);
  const blockData = graphDataMap.get(checkedGraphBlockId);
  useEffect(() => {
    if (blockData.shape === 'group') {
      const labelValue = translateGroup(blockData);
      const node = graphData.nodes.find(
        item => item.id === checkedGraphBlockId
      );
      node.label = labelValue;
      blockData['properties'][0]['value'] = labelValue;
      event.emit('resetGraph', labelValue, checkedGraphBlockId);
      setTimeout(() => {
        updateGraphData(graphData);
        synchroGraphDataToProcessTree();
      }, 0);
    }
  }, [translateTag]);

  // const [tag, setTag] = useState(ifItem.tag);

  // const handleAdd = () => {
  //   if (ifItem.valueList) {
  //     ifItem.valueList.push({
  //       v1: '',
  //       v2: '',
  //       rule: '',
  //       connect: '',
  //     });
  //     forceUpdate();
  //   }
  // };

  // const handleDelete = index => {
  //   ifItem.valueList.splice(index, 1);
  //   forceUpdate();
  // };

  const forceUpdate = () => {
    setFlag(true);
    setTimeout(() => {
      setFlag(false);
    }, 50);
  };

  const handleLableChange = useDebounce((e, str) => {
    const labelValue = str !== undefined ? str : e.target.value;
    param.value = labelValue;

    const node = graphData.nodes.find(item => item.id === checkedGraphBlockId);

    node.label = labelValue;

    event.emit('resetGraph', labelValue, checkedGraphBlockId);

    setTimeout(() => {
      updateGraphData(graphData);
      synchroGraphDataToProcessTree();
    }, 0);
  }, 333);

  if (param.cnName === '分支条件') {
    return (
      <div
        style={{
          padding: '4px 8px',
        }}
      >
        <ShowCondition
          checkedGraphBlockId={checkedGraphBlockId}
          graphData={graphData}
          forceUpdate={forceUpdate}
          noticyBlockCodeChange={noticyBlockCodeChange}
          param={param}
        ></ShowCondition>
      </div>
    );
  } else if (param.cnName === '循环类型') {
    return (
      <div
        style={{
          padding: '4px 8px',
        }}
      >
        <div>循环类型</div>
        <SelectContext.Consumer>
          {({ setLoopSelect }) => (
            <Select
              style={{ width: '100%' }}
              defaultValue={param.value || param.default}
              dropdownMatchSelectWidth={false}
              onChange={value => {
                param.value = value;
                forceUpdate();
                synchroGraphDataToProcessTree();
                noticyBlockCodeChange();
                setLoopSelect(value);
                setTranslateTag(translateTag + 1);
                // console.log(translateGroup(blockData));
              }}
            >
              {param.valueMapping &&
                param.valueMapping.map(item => (
                  <Option key={item.value} value={item.value}>
                    {item.name}
                  </Option>
                ))}
            </Select>
          )}
        </SelectContext.Consumer>
      </div>
    );
  } else if (param.cnName === '循环条件') {
    return (
      <SelectContext.Consumer>
        {({ loopSelect }) => (
          <ShowLoop
            setTranslateTag={setTranslateTag}
            translateTag={translateTag}
            handleLableChange={handleLableChange}
            param={param}
            loopSelect={loopSelect}
            noticyBlockCodeChange={noticyBlockCodeChange}
            checkedGraphBlockId={checkedGraphBlockId}
            graphData={graphData}
            forceUpdate={forceUpdate}
          ></ShowLoop>
        )}
      </SelectContext.Consumer>
    );
  } else {
    return (
      <Fragment>
        {blockData.shape === 'group' ? null : (
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
              id="input-value"
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
                      setTimeout(() => {
                        updateGraphData(save());
                        synchroGraphDataToProcessTree();
                      }, 0);
                      noticyBlockCodeChange();
                    }
              }
            />
          </div>
        )}
      </Fragment>
    );
  }
};

const NormalInput = ({ param, setTranslateTag, translateTag }) => {
  return (
    <div
      style={{
        padding: '4px 8px',
      }}
    >
      <span style={{ flex: 1, whiteSpace: 'nowrap', marginRight: '8px' }}>
        {param.cnName}
      </span>
      <Input
        id="input-value"
        defaultValue={param.value}
        onChange={e => {
          param.value = e.target.value;
          setTranslateTag(translateTag + 1);
        }}
      />
    </div>
  );
};

const ShowCondition = ({
  noticyBlockCodeChange,
  graphData,
  forceUpdate,
  param,
  setTranslateTag,
  translateTag,
}) => {
  // const ifItem = graphDataMap.get(checkedGraphBlockId).properties[1];
  const [tag, setTag] = useState(param.tag);

  useEffect(() => {
    if (param.valueList.length > 0) {
      if (param.valueList[0].id === undefined) {
        param.valueList.map((item, index) => {
          item.id = index;
          return item;
        });
      }
    }
  }, []);

  const handleDelete = index => {
    param.valueList.splice(index, 1);
    setTranslateTag && setTranslateTag(translateTag + 1);
    forceUpdate();
  };

  const handleAdd = () => {
    if (param.valueList) {
      let maxId = 0;
      if (param.valueList.length !== 0) {
        maxId = param.valueList[param.valueList.length - 1].id;
      }
      // 每次push到数组末尾，最大id为数组最后值的id
      // 如更改添加方式，同时变更id添加方式
      param.valueList.push({
        v1: '',
        v2: '',
        rule: '',
        connect: '',
        id: maxId + 1,
      });
      setTranslateTag && setTranslateTag(translateTag + 1);
      forceUpdate();
    }
  };

  return (
    <div>
      <Radio.Group
        style={{
          display: 'flex',
          marginBottom: '10px',
        }}
        onChange={e => {
          // ifItem.tag = e.target.value;

          param.tag = e.target.value;
          param.forceUpdate = param.forceUpdate + 1;
          setTag(e.target.value);
          setTranslateTag && setTranslateTag(translateTag + 1);
          synchroGraphDataToProcessTree();
          noticyBlockCodeChange();
        }}
        defaultValue={param.tag ? param.tag : 2}
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
            {(param.valueList || []).map((item, index) => {
              return (
                <Fragment key={item.id}>
                  <div className="condition-param-ifcondition">
                    <Input
                      placeholder="输入文本"
                      defaultValue={item.v1}
                      onChange={e => {
                        item.v1 = e.target.value;
                        setTranslateTag && setTranslateTag(translateTag + 1);
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
                        setTranslateTag && setTranslateTag(translateTag + 1);
                        synchroGraphDataToProcessTree();
                        noticyBlockCodeChange();
                      }}
                    >
                      {(param.valueMapping || []).map(ruleItem => (
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
                        setTranslateTag && setTranslateTag(translateTag + 1);
                        synchroGraphDataToProcessTree();
                        noticyBlockCodeChange();
                      }}
                    />
                    <Icon
                      type="delete"
                      className="condition-param-btn"
                      onClick={() => {
                        handleDelete(index);
                        setTranslateTag && setTranslateTag(translateTag + 1);
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
                        setTranslateTag && setTranslateTag(translateTag + 1);
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
          defaultValue={param.value || param.default}
          onChange={e => {
            param.value = e.target.value;
            setTranslateTag && setTranslateTag(translateTag + 1);
            synchroGraphDataToProcessTree();
            noticyBlockCodeChange();
          }}
        />
      )}
    </div>
  );
};

const ShowLoop = ({
  param,
  noticyBlockCodeChange,
  loopSelect,
  graphData,
  forceUpdate,
  checkedGraphBlockId,
  setTranslateTag,
  translateTag,
}) => {
  if (loopSelect === 'for_condition') {
    return (
      <div
        style={{
          padding: '4px 8px',
        }}
      >
        <ShowCondition
          checkedGraphBlockId={checkedGraphBlockId}
          graphData={graphData}
          forceUpdate={forceUpdate}
          noticyBlockCodeChange={noticyBlockCodeChange}
          param={param}
          setTranslateTag={setTranslateTag}
          translateTag={translateTag}
        ></ShowCondition>
      </div>
    );
  } else {
    return (
      <Fragment>
        {param[loopSelect]
          ? param[loopSelect].map((item, index) => (
              <NormalInput
                param={item}
                key={item.id}
                onChange={() => {
                  param.forceUpdate = param.forceUpdate + 1;
                }}
                setTranslateTag={setTranslateTag}
                translateTag={translateTag}
              />
            ))
          : null}
      </Fragment>
    );
  }
};

export default withPropsAPI(
  ({ propsAPI, checkedGraphBlockId, graphDataMap, blockNode, graphData }) => {
    const noticyBlockCodeChange = useNoticyBlockCodeChange();
    const [flag, setFlag] = useState(false);

    const getLoop = blockNode => {
      if (blockNode) {
        if (blockNode.properties) {
          if (blockNode.properties[1].cnName === '循环类型') {
            return blockNode.properties[1].value
              ? blockNode.properties[1].value
              : 'for_list';
          } else {
            return '';
          }
        } else {
          return '';
        }
      } else {
        return '';
      }
    };

    useEffect(() => {
      setLoopSelect(getLoop(blockNode));
    }, [blockNode]);

    const [loopSelect, setLoopSelect] = useState('');

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
            <SelectContext.Provider
              value={{
                loopSelect,
                setLoopSelect,
              }}
              key={index}
            >
              <FormItem
                param={param}
                graphDataMap={graphDataMap}
                graphData={graphData}
                checkedGraphBlockId={checkedGraphBlockId}
                setFlag={setFlag}
                propsAPI={propsAPI}
                noticyBlockCodeChange={noticyBlockCodeChange}
              />
            </SelectContext.Provider>
          );
        })}
      </div>
    );
  }
);
