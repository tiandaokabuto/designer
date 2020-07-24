/* eslint-disable react/no-this-in-sfc */
import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { message } from 'antd';
import uniqueId from 'lodash/uniqueId';

import useMxId from '../methods/useMxId';
import { setGraphDataMap } from '../../../../reduxActions';
import mxgraph from '../mxgraph';
// import FlowItemPanel from '../../../layout/GraphContainer/components/FlowItemPanel';

import './MxGraphHeader.scss';

import { Action_findNode } from '../actions/findNode';

const {
  mxCell: MxCell,
  mxGeometry: MxGeometry,
  mxRectangle: MxRectangle,
  mxUtils,
  mxEvent,
  mxEventObject,
  mxDragSource,
} = mxgraph;

const MxGraphHeader = ({ graph, container }) => {
  const graphData = useSelector(state => state.grapheditor.graphData);
  const graphDataRef = useRef(null);
  graphDataRef.current = graphData;

  const getMxId = useMxId();
  // const graphDataMap = useSelector(state => state.grapheditor.graphDataMap);

  /**
   * 判断是否是可容纳组件
   * @param {mxCell} cell 单元
   */
  const isContainer = cell => {
    const style = graph.getCellStyle(cell);

    if (graph.isSwimlane(cell)) {
      return style.container !== 0;
    } else {
      return style.container === 1;
    }
  };

  // const onComponentDragStart = (e, componentName) => {
  //   e.dataTransfer.setData(
  //     componentName,
  //     e.target.getAttribute('data-component-type')
  //   );
  // };

  const createDragSource = (elt, dropHandler, preview, cells, bounds) => {
    let firstVertex = null;
    let activeArrow = null;

    // 获得单元格组中的顶点单元格索引
    for (let i = 0; i < cells.length; i += 1) {
      if (firstVertex == null && graph.model.isVertex(cells[i])) {
        firstVertex = i;
      }
      if (firstVertex !== null) {
        break;
      }
    }

    // 成功拖拽后的回调方法
    const funt = mxUtils.bind(this, function (...args) {
      dropHandler.apply(this, args);
    });

    // 将给定的DOM元素elt配置为指定图形的拖动源preview。返回一个新的mxDragSource。scalePreview缩放设置，highlightDropTargets高亮拖拽目标
    const dragX = 0;
    const dragY = 0;
    const scalePreview = true;
    const highlightDropTargets = true;

    const dragSource = mxUtils.makeDraggable(
      elt,
      graph,
      funt,
      preview,
      dragX,
      dragY,
      graph.autoscroll,
      scalePreview,
      highlightDropTargets
    );

    dragSource.dragOver = function (...args) {
      mxDragSource.prototype.dragOver.apply(this, args);
    };

    // 仅当拖拽目标是一个合法根的时候可以拖进
    dragSource.getDropTarget = mxUtils.bind(this, function (graph, x, y, evt) {
      // Alt表示没有目标
      // 得到与x，y相交的底层单元格
      let cell =
        !mxEvent.isAltDown(evt) && cells !== null
          ? graph.getCellAt(x, y)
          : null;

      // 使用可连接的父顶点（如果存在）
      if (cell !== null && !graph.isCellConnectable(cell)) {
        const parent = graph.getModel().getParent(cell);

        if (
          graph.getModel().isVertex(parent) &&
          graph.isCellConnectable(parent)
        ) {
          cell = parent;
        }
      }

      // 忽略锁定的单元格
      if (graph.isCellLocked(cell)) {
        cell = null;
      }
      activeArrow = null;

      // 处理拖拽容器
      let target =
        !mxEvent.isAltDown(evt) || mxEvent.isShiftDown(evt)
          ? mxDragSource.prototype.getDropTarget.apply(this, arguments)
          : null;
      const model = graph.getModel();
      if (target !== null) {
        if (activeArrow !== null || !graph.isSplitTarget(target, cells, evt)) {
          // Selects parent group as drop target
          while (
            target !== null &&
            !graph.isValidDropTarget(target, cells, evt) &&
            model.isVertex(model.getParent(target))
          ) {
            target = model.getParent(target);
          }

          if (
            target !== null &&
            (graph.view.currentRoot == target ||
              (!graph.isValidRoot(target) &&
                graph.getModel().getChildCount(target) == 0) ||
              graph.isCellLocked(target) ||
              model.isEdge(target) ||
              !graph.isValidDropTarget(target, cells, evt))
          ) {
            target = null;
          }
        }
      }

      return target;
    });

    return dragSource;
  };

  // const get_graphData = ()=>{
  //   return graphData;
  // }

  // 创建处理拖拽后的回调函数
  const createDropHandler = (cells, allowSplit, allowCellsInserted, bounds) => {
    const allowCellsInsertedValue =
      allowCellsInserted !== null ? allowCellsInserted : true;

    // 更新视图
    return mxUtils.bind(this, function (graph, evt, target, x, y, force) {
      let elt = null;
      if (!force) {
        elt = mxEvent.isTouchEvent(evt) /* || mxEvent.isPenEvent(evt) */
          ? document.elementFromPoint(
              mxEvent.getClientX(evt),
              mxEvent.getClientY(evt)
            )
          : mxEvent.getSource(evt);
      }

      while (elt !== null && elt !== container) {
        elt = elt.parentNode;
      }

      if (elt == null && graph.isEnabled()) {
        const importableCells = graph.getImportableCells(cells);

        // 拦截，只能有一个开始和结束
        console.log(`ok`, importableCells[0], graphDataRef.current);
        if (
          importableCells[0].value === '开始' &&
          Action_findNode('nodes.label', '开始', graphDataRef.current)
        )
          return message.info('开始块只能有一个');

        if (
          importableCells[0].value === '开始' &&
          Action_findNode('nodes.label', '结束', graphDataRef.current)
        )
          return message.info('结束块只能有一个');

        if (importableCells.length > 0) {
          graph.stopEditing();

          // Holding alt while mouse is released ignores drop target
          const validDropTarget =
            target !== null && !mxEvent.isAltDown(evt)
              ? graph.isValidDropTarget(target, importableCells, evt) ||
                isContainer(target)
              : false;
          let select = null;

          if (target !== null && !validDropTarget) {
            target = null;
          }

          if (!graph.isCellLocked(target || graph.getDefaultParent())) {
            graph.model.beginUpdate();
            try {
              x = Math.round(x);
              y = Math.round(y);

              // Splits the target edge or inserts into target group
              if (
                allowSplit &&
                graph.isSplitTarget(target, importableCells, evt)
              ) {
                const s = graph.view.scale;
                const tr = graph.view.translate;
                const tx = (x + tr.x) * s;
                const ty = (y + tr.y) * s;

                const clones = graph.cloneCells(importableCells);
                graph.splitEdge(
                  target,
                  clones,
                  null,
                  x - bounds.width / 2,
                  y - bounds.height / 2,
                  tx,
                  ty
                );
                select = clones;
              } else if (importableCells.length > 0) {
                select = graph.importCells(importableCells, x, y, target);
              }

              // Executes parent layout hooks for position/order
              if (graph.layoutManager !== null) {
                const layout = graph.layoutManager.getLayout(target);

                if (layout !== null) {
                  const s = graph.view.scale;
                  const tr = graph.view.translate;
                  const tx = (x + tr.x) * s;
                  const ty = (y + tr.y) * s;

                  for (let i = 0; i < select.length; i += 1) {
                    layout.moveCell(select[i], tx, ty);
                  }
                }
              }

              if (
                allowCellsInsertedValue &&
                (evt == null || !mxEvent.isShiftDown(evt))
              ) {
                graph.fireEvent(
                  new mxEventObject('cellsInserted', 'cells', select)
                );
              }
            } catch (e) {
              // this.editorUi.handleError(e);
            } finally {
              graph.model.endUpdate();
              if (select[0]) {
                // select[0].id = `mx_${uniqueId()}`;
                select[0].id = getMxId();
                console.log(select[0].id);
                if (select[0].value.indexOf("class='compoent-content'") > -1) {
                  setGraphDataMap(select[0].id, {
                    shape: 'processblock',
                    properties: [
                      {
                        cnName: '标签名称',
                        enName: 'label',
                        value: '流程块',
                        default: '',
                      },
                      {
                        cnName: '输入参数',
                        enName: 'param',
                        value: [],
                        default: '',
                      },
                      {
                        cnName: '流程块返回',
                        enName: 'output',
                        value: [],
                        default: '',
                      },
                    ],
                    variable: [],
                  });
                } else if (
                  select[0].value.indexOf("class='rcomponent-content'") > -1
                ) {
                  setGraphDataMap(select[0].id, {
                    shape: 'rhombus-node',
                    properties: [
                      {
                        cnName: '标签名称',
                        enName: 'label',
                        value: '判断',
                        default: '',
                      },
                      {
                        cnName: '分支条件',
                        enName: 'condition',
                        value: '',
                        default: '',
                        valueMapping: [
                          { name: '等于', value: '==' },
                          { name: '不等于', value: '!=' },
                          { name: '大于', value: '>' },
                          { name: '小于', value: '<' },
                          { name: '大于等于', value: '>=' },
                          { name: '小于等于', value: '<=' },
                          { name: '空', value: 'is None' },
                          { name: '非空', value: 'not None' },
                        ],
                        tag: 1,
                        valueList: [],
                      },
                    ],
                  });
                }
              }
            }

            if (select !== null && select.length > 0) {
              graph.scrollCellToVisible(select[0]);
              graph.setSelectionCells(select);
            }

            if (
              graph.editAfterInsert &&
              evt !== null &&
              mxEvent.isMouseEvent(evt) &&
              select !== null &&
              select.length === 1
            ) {
              window.setTimeout(function () {
                graph.startEditing(select[0]);
              }, 0);
            }
          }
        }

        mxEvent.consume(evt);
      }
    });
  };

  // 添加点击事件处理函数--（待添加）
  const addClickHandler = (elt, ds, cells) => {
    const oldMouseUp = ds.mouseUp;
    let first = null;

    ds.mouseUp = function (evt) {
      try {
        if (
          !mxEvent.isPopupTrigger(evt) &&
          this.currentGraph == null &&
          this.dragElement !== null &&
          this.dragElement.style.display === 'none'
        ) {
          // sb.itemClicked(cells, ds, evt, elt);
        }

        oldMouseUp.apply(ds, arguments);
        mxUtils.setOpacity(elt, 100);
        first = null;

        // Blocks tooltips on this element after single click
        // sb.currentElt = elt;
      } catch (e) {
        ds.reset();
        // sb.editorUi.handleError(e);
      }
    };
  };

  // 创建可拖拽的单元源，当拖拽结束时，生成对应的单元格
  const createItem = (cells, width, height, title, allowCellsInserted, elt) => {
    const bounds = new MxRectangle(0, 0, width, height);
    if (cells.length > 1 || cells[0].vertex) {
      /* const ds =  */ createDragSource(
        elt,
        createDropHandler(cells, true, allowCellsInserted, bounds),
        // this.createDragPreview(width, height),
        null,
        cells,
        bounds
      );
      // addClickHandler(elt, ds, cells);
    }
  };

  // 处理工具栏上的组件，使其可拖拽生成对应单元
  useEffect(() => {
    if (graph) {
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

  return (
    <div className="designergraph-container-header">
      <div className="designergraph-container-header-tool">
        <div
          className="mxgraph-cell designergraph-container-header-tool-start"
          data-width="50"
          data-height="50"
          data-style="shape=ellipse;label;whiteSpace=wrap;html=1;resizable=0;align=center"
          data-label="开始"
        >
          开始
        </div>

        <div
          className="mxgraph-cell designergraph-container-header-tool-process"
          data-width="186"
          data-height="55"
          data-style="label;whiteSpace=wrap;html=1;;resizable=0;" //image=../../../../images/icon.jpg"
          data-label="<div class='compoent-content'><label class='component-icon'></label><span class='component-name' title='process'>流程块</span></div>"
        >
          流程块
        </div>

        <div
          className="mxgraph-cell designergraph-container-header-tool-condition"
          data-width="100"
          data-height="100"
          data-style="shape=rhombus;perimeter=ellipsePerimeter;resizable=0"
          data-label="<div class='rcomponent-content'><label class='rcomponent-content-icon'></label><span class='rcomponent-name' title='condition'>判断</span></div>"
        >
          <div className="designergraph-container-header-tool-condition-left">
            <span />
          </div>
          <div className="designergraph-container-header-tool-condition-right">
            <span />
          </div>
          <span style={{ position: 'absolute', right: '18px' }}>判断</span>
        </div>

        <div
          className="mxgraph-cell designergraph-container-header-tool-ground"
          data-width="186"
          data-height="55"
          data-style="group;html=1;whiteSpace=wrap;container=1;recursiveResize=0;collapsible=0;"
          data-label="contain"
        >
          容器
        </div>

        <div
          className="mxgraph-cell designergraph-container-header-tool-end"
          data-width="80"
          data-height="55"
          data-style="ellipse;shape=doubleEllipse;label;whiteSpace=wrap;html=1;;resizable=0;align=center"
          data-label="结束"
        >
          结束
        </div>
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
