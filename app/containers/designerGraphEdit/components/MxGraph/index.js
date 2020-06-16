import React, { useRef, useEffect } from 'react';
import { mxGraph as MxGraph } from 'mxgraph-js';

import MxGraphHeader from './components/MxGraphHeader';
import DataSourceComponent from './DataSourceComponent';

import './index.scss';

const MxgraphContainer = () => {
  const graphContainer = useRef(null);

  const container = graphContainer.current;
  const graph = new MxGraph(container);

  useEffect(() => {
    // 启用插入html label
    graph.htmlLabels = true;
  }, []);

  /*   useEffect(() => {
    this.createDataSourceCellEmitter = emitter.addListener(
      'createDataSourceCell',
      createDataSourceCell
    );
    return emitter.removeListener('createDataSourceCell', createDataSourceCell);
  }, []);

  const createDataSourceCell = (commonData, data) => {
    new DataSourceComponent(this.graph, commonData, data);
  }; */

  const onDrop = e => {
    let componentToDropType = e.dataTransfer.getData('componentToDropType');
    if (componentToDropType) {
      let x = e.clientX;
      let y = e.clientY;
      console.log(x, y);
      /* let left = x - 450 + offsetLeft;
      let top = y - 70 + offsetTop;

      if (left < 0 || top < 0) {
        message.info('拖动超出操作区域');
        this.loadExp(this.state.currentExp.id);
        return;
      } */

      /* http
          .POST(api.dataMining.addComponentNode, {
            component_type: componentNames[componentToDropType]
              ? componentToDropType
              : 'LogisticRegression',
            experiment_id: this.state.currentExp.id,
            input_size: this.getInputSize(
              componentNames[componentToDropType]
                ? componentToDropType
                : 'LogisticRegression'
            ),
            node_name: componentNames[componentToDropType]
              ? componentNames[componentToDropType]
              : componentToDropType,
            node_status: 0,
            parameters: '',
            parameters_front: '',
            style: '',
            x: left,
            y: top,
          })
          .then(response => response.json())
          .then(json => {
            let data = json.data;

            if (json.success) {
              emitter.emit(
                'createFunctionCell',
                {
                  left: left,
                  top: top,
                  componentType: data.component_type,
                  nodeId: data.id,
                  name: data.node_name,
                  node_status: 0,
                },
                {}
              );
            } else {
              message.error(json.msg);
            }
          }); */
    }
  };

  const allowDrop = e => {
    e.preventDefault();
  };

  return (
    <div id="graphContent">
      <MxGraphHeader />
      <div onDrop={onDrop} className="dropContent" onDragOver={allowDrop}>
        <div
          className="graph-container"
          ref={graphContainer}
          id="graphContainer"
        />
      </div>
    </div>
  );
};

export default MxgraphContainer;
