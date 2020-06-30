/* eslint-disable react/no-this-in-sfc */
import React, { useEffect } from 'react';
import {
  mxCell,
  mxGeometry,
  mxRectangle,
  mxUtils,
  mxConstants,
  mxEvent,
  mxEventObject,
  mxDragSource,
  mxPoint,
  mxGraph,
  Graph,
} from 'mxgraph-js';
import PropTypes from 'prop-types';
// import FlowItemPanel from '../../../layout/GraphContainer/components/FlowItemPanel';

import './MxGraphHeader.scss';

const MxGraphHeader = ({ graph, container }) => {
  /**
   * 判断是否是可容纳组件
   * @param {*} cell 单元
   */
  const isContainer = cell => {
    const style = graph.getCellStyle(cell);

    if (graph.isSwimlane(cell)) {
      return style.container !== 0;
    } else {
      return style.container === 1;
    }
  };

  const onComponentDragStart = (e, componentName) => {
    e.dataTransfer.setData(
      componentName,
      e.target.getAttribute('data-component-type')
    );
  };

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
    const funt = mxUtils.bind(this, function(...args) {
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

    dragSource.dragOver = function(...args) {
      mxDragSource.prototype.dragOver.apply(this, args);
    };

    // 仅当拖拽目标是一个合法根的时候可以拖进
    dragSource.getDropTarget = mxUtils.bind(this, function(graph, x, y, evt) {
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
            !isContainer(target) &&
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
              (!graph.isValidDropTarget(target, cells, evt) &&
                !isContainer(target)))
          ) {
            target = null;
          }
        }
      }

      return target;
    });

    return dragSource;
  };

  // 创建处理拖拽后的回调函数
  const createDropHandler = (cells, allowSplit, allowCellsInserted, bounds) => {
    const allowCellsInsertedValue =
      allowCellsInserted !== null ? allowCellsInserted : true;

    // 更新视图
    return mxUtils.bind(this, function(graph, evt, target, x, y, force) {
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
              window.setTimeout(function() {
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

    ds.mouseUp = function(evt) {
      try {
        if (
          !mxEvent.isPopupTrigger(evt) &&
          this.currentGraph == null &&
          this.dragElement !== null &&
          this.dragElement.style.display === 'none'
        ) {
          //sb.itemClicked(cells, ds, evt, elt);
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
    const bounds = new mxRectangle(0, 0, width, height);
    if (cells.length > 1 || cells[0].vertex) {
      const ds = createDragSource(
        elt,
        createDropHandler(cells, true, allowCellsInserted, bounds),
        // this.createDragPreview(width, height),
        null,
        cells,
        bounds
      );
      addClickHandler(elt, ds, cells);
    }
  };

  // 处理工具栏上的组件，使其可拖拽生成对应单元
  useEffect(() => {
    if (graph) {
      let cell = null;
      for (let i = 0; i < 2; i += 1) {
        const label = i === 0 ? 'contain' : 'process';
        const style =
          i === 0
            ? 'html=1;whiteSpace=wrap;container=1;recursiveResize=0;collapsible=0;'
            : 'label;whiteSpace=wrap;html=1;image=../../../../images/icon.jpg';
        cell = new mxCell(label, new mxGeometry(0, 0, 160, 70), style);
        cell.vertex = true;
        const eltClassName = i === 0 ? 'ground' : 'process';
        const elt = document.getElementsByClassName(
          `designergraph-container-header-tool-${eltClassName}`
        )[0];
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
        {/* <div
          className="designergraph-container-header-tool-process"
          draggable
          data-component-type="process"
          onDragStart={e => onComponentDragStart(e, 'componentToDropType')}
        >
          流程块
        </div> */}
        <div className="designergraph-container-header-tool-process">
          流程块
        </div>

        <div
          className="designergraph-container-header-tool-rhombus"
          draggable
          data-component-type="rhombus"
          onDragStart={e => onComponentDragStart(e, 'rComponentToDropType')}
        >
          <div className="designergraph-container-header-tool-rhombus-left">
            <span />
          </div>
          <div className="designergraph-container-header-tool-rhombus-right">
            <span />
          </div>
          <span style={{ position: 'absolute', right: '18px' }}>判断</span>
        </div>

        <div className="designergraph-container-header-tool-ground">容器</div>
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
