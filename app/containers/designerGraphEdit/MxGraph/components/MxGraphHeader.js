/* eslint-disable react/no-this-in-sfc */
import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { message } from 'antd';
import uniqueId from 'lodash/uniqueId';

import useMxId from '../methods/useMxId';
import {
  setGraphDataMap,
  changeCheckedGraphBlockId,
} from '../../../reduxActions';
import mxgraph from '../mxgraph';
// import FlowItemPanel from '../../../layout/GraphContainer/components/FlowItemPanel';

import './MxGraphHeader.scss';

import { Action_findNode } from '../actions/findNode';
import { updateGraphDataAction } from '../mxgraphAction';

import LiuchengImage from '../images/liuchengkuai.png';
import JieshuImage from '../images/jieshu.png';
import PanduanImage from '../images/panduan.png';
import JixutiaochuImage from '../images/jixutiaochu.png';

const {
  mxCell: MxCell,
  mxGeometry: MxGeometry,
  mxRectangle: MxRectangle,
  mxUtils,
  mxEvent,
  mxEventObject,
  mxDragSource,
} = mxgraph;

const MxGraphHeader = ({ graph, container, createItem, conRight }) => {
  // const graphDataMap = useSelector(state => state.grapheditor.graphDataMap);

  // const onComponentDragStart = (e, componentName) => {
  //   e.dataTransfer.setData(
  //     componentName,
  //     e.target.getAttribute('data-component-type')
  //   );
  // };
  // 添加点击事件处理函数--（待添加）
  // const addClickHandler = (elt, ds, cells) => {
  //   const oldMouseUp = ds.mouseUp;
  //   let first = null;

  //   ds.mouseUp = function (evt) {
  //     try {
  //       if (
  //         !mxEvent.isPopupTrigger(evt) &&
  //         this.currentGraph == null &&
  //         this.dragElement !== null &&
  //         this.dragElement.style.display === 'none'
  //       ) {
  //         // sb.itemClicked(cells, ds, evt, elt);
  //       }

  //       oldMouseUp.apply(ds, arguments);
  //       mxUtils.setOpacity(elt, 100);
  //       first = null;

  //       // Blocks tooltips on this element after single click
  //       // sb.currentElt = elt;
  //     } catch (e) {
  //       ds.reset();
  //       // sb.editorUi.handleError(e);
  //     }
  //   };
  // };

  // 处理工具栏上的组件，使其可拖拽生成对应单元
  useEffect(() => {
    if (graph) {
      console.log('重新绑定工具栏');
      let cell = null;
      const toolCells = document.querySelectorAll('.mxgraph-cell');
      for (let i = 0; i < toolCells.length; i += 1) {
        const elt = toolCells[i];
        const { label, style, width, height } = elt.dataset;
        cell = new MxCell(
          label,
          new MxGeometry(0, 0, parseInt(width, 10), parseInt(height, 10)),
          style
        );
        cell.vertex = true;

        createItem(
          [cell],
          cell.geometry.width,
          cell.geometry.height,
          'Shape Group',
          null,
          elt
        );
      }
    }
  }, [graph]);

  useEffect(() => {
    // 工具栏
    // const toolDom = document.querySelector('.designergraph-container-header');
    // 输出面板
    const toolDom = document.querySelector('.designergraph-container-header');

    const rightDom = document.querySelector('.designergraph-parampanel');
    const rightWidth = localStorage.getItem('firstRight');
    const leftDom = document.querySelector('.designergraph-item');
    const leftWidth = localStorage.getItem('firstLeft');

    toolDom.style.width = `calc(100vw - ${rightDom.style.width} - ${leftDom.style.width})`;
    toolDom.style.left = leftDom.style.width;
  }, [conRight]);

  return (
    <div className="designergraph-container-header">
      <div className="designergraph-container-header-tool">
        {/**
        <div
          className="mxgraph-cell designergraph-container-header-tool-start"
          data-width="50"
          data-height="50"
          data-style="shape=ellipse;label;whiteSpace=wrap;html=1;resizable=0;align=center;shadow=1;"
          data-label="开始"
        >
          开始
        </div>
 */}
        <div
          className="mxgraph-cell designergraph-container-header-tool-process"
          data-width="96"
          data-height="48"
          data-style="label;whiteSpace=wrap;html=1;resizable=0;shadow=1;rounded=1;fillColor=#F2FAF7;strokeColor=#32A67F;gradientColor=none;fontColor=#000000;" //image=../../../../images/icon.jpg"
          data-label="<div class='compoent-content'><label class='component-icon'></label><span class='component-name' title='process'>流程块</span></div>"
        >
          流程块
        </div>

        {/* <div
          className="mxgraph-cell designergraph-container-header-tool-condition"
          data-width="100"
          data-height="100"
          data-style="shape=rhombus;perimeter=ellipsePerimeter;resizable=0;"
          data-label="<div class='rcomponent-content'><label class='rcomponent-content-icon'></label><span class='rcomponent-name' title='condition'>判断</span></div>"
        >
          <div className="designergraph-container-header-tool-condition-left">
            <span />
          </div>
          <div className="designergraph-container-header-tool-condition-right">
            <span />
          </div>
          <span style={{ position: 'absolute', right: '18px' }}>判断</span>
        </div> */}
        <div
          className="mxgraph-cell designergraph-container-header-tool-condition mxgraph-cell-none-border"
          data-width="58"
          data-height="58"
          data-style="shape=rhombus;perimeter=ellipsePerimeter;resizable=0;fillColor=#F2FAF7;strokeColor=#32A67F;shadow=1;"
          data-label="<div class='rcomponent-content'>判断</div>"
        >
          判断
        </div>

        <div
          className="mxgraph-cell designergraph-container-header-tool-ground"
          data-width="286"
          data-height="402"
          data-style="group;html=1;whiteSpace=wrap;container=1;recursiveResize=0;collapsible=0;shadow=1;"
          data-label="异常捕获"
        >
          异常捕获
        </div>

        <div
          className="mxgraph-cell designergraph-container-header-tool-ground"
          data-width="286"
          data-height="402"
          data-style="group;html=1;whiteSpace=wrap;container=1;recursiveResize=0;collapsible=0;shadow=1;"
          data-label="<span class='group-content'>循环</span>"
        >
          循环
        </div>

        <div
          className="mxgraph-cell designergraph-container-header-tool-break"
          data-width="96"
          data-height="48"
          data-style="shape=hexagon;whiteSpace=wrap;align=centerhtml=1;strokeColor=#32A67F;fillColor=#F2FAF7;resizable=0;shadow=1;" //image=../../../../images/icon.jpg"
          data-label="跳出循环"
        >
          跳出循环
        </div>

        <div
          className="mxgraph-cell designergraph-container-header-tool-break"
          data-width="96"
          data-height="48"
          data-style="shape=hexagon;whiteSpace=wrap;align=centerhtml=1;resizable=0;strokeColor=#32A67F;fillColor=#F2FAF7;shadow=1;" //image=../../../../images/icon.jpg"
          data-label="继续循环"
        >
          继续循环
        </div>

        <div
          className="mxgraph-cell designergraph-container-header-tool-end"
          data-width="80"
          data-height="55"
          data-style="ellipse;shape=doubleEllipse;label;whiteSpace=wrap;html=1;fillColor=#F2FAF7;strokeColor=#32A67F;resizable=0;align=center;shadow=1;"
          data-label="<span>结束</span>"
        >
          结束
        </div>

        {/* <div
          className="mxgraph-cell designergraph-container-header-tool-test"
          data-width="80"
          data-height="55"
        >
          <p></p>
          <span>判断</span>
        </div> */}
      </div>
      <span className="designergraph-container-header-title">
        {/* node && node.title */}
      </span>
    </div>
  );
};

export default MxGraphHeader;

MxGraphHeader.propTypes = {
  graph: PropTypes.object,
};
