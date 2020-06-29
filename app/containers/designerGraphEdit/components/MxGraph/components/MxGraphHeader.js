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
  let updateThread = null;

  const dropTargetDelay = 200;

  const thisGraph = graph;

  mxGraph.prototype.isValidDropTarget = function(cell, cells, evt) {
    return (
      cell != null &&
      ((this.isSplitEnabled() && this.isSplitTarget(cell, cells, evt)) ||
        (!this.model.isEdge(cell) &&
          (this.isSwimlane(cell) ||
            (this.model.getChildCount(cell) > 0 &&
              !this.isCellCollapsed(cell)))))
    );
  };

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

  const isDropStyleEnabled = (cells, firstVertex) => {
    let result = true;

    if (firstVertex !== null && cells.length === 1) {
      const vstyle = graph.getCellStyle(cells[firstVertex]);

      if (vstyle !== null) {
        result =
          mxUtils.getValue(
            vstyle,
            mxConstants.STYLE_STROKECOLOR,
            mxConstants.NONE
          ) !== mxConstants.NONE ||
          mxUtils.getValue(
            vstyle,
            mxConstants.STYLE_FILLCOLOR,
            mxConstants.NONE
          ) !== mxConstants.NONE;
      }
    }

    return result;
  };

  const isDropStyleTargetIgnored = state => {
    return graph.isSwimlane(state.cell);
  };

  const createDragSource = (elt, dropHandler, preview, cells, bounds) => {
    let firstVertex = null;
    let freeSourceEdge = null;
    let currentStyleTarget = null;
    let activeArrow = null;
    let styleTarget = null;
    let currentTargetState = null;
    let prev = null;
    let startTime = new Date().getTime();
    let timeOnTarget = 0;
    let styleTargetParent = null;
    let activeTarget = false;
    let direction = mxConstants.DIRECTION_NORTH;
    let currentStateHandle = null;
    // Gets source cell style to compare shape below
    const sourceCellStyle = graph.getCellStyle(cells[0]);

    for (let i = 0; i < cells.length; i += 1) {
      if (firstVertex == null && graph.model.isVertex(cells[i])) {
        firstVertex = i;
      } else if (
        freeSourceEdge == null &&
        graph.model.isEdge(cells[i]) &&
        graph.model.getTerminal(cells[i], true) == null
      ) {
        freeSourceEdge = i;
      }

      if (firstVertex !== null && freeSourceEdge !== null) {
        break;
      }
    }

    const dropStyleEnabled = isDropStyleEnabled(cells, firstVertex);

    const funt = mxUtils.bind(this, function(graph, evt, target, x, y) {
      if (updateThread !== null) {
        window.clearTimeout(updateThread);
      }

      if (
        cells !== null &&
        currentStyleTarget !== null &&
        activeArrow === styleTarget
      ) {
        const tmp = graph.isCellSelected(currentStyleTarget.cell)
          ? graph.getSelectionCells()
          : [currentStyleTarget.cell];
        /* const updatedCells = this.updateShapes(
          graph.model.isEdge(currentStyleTarget.cell)
            ? cells[0]
            : cells[firstVertex],
          tmp
        );
        graph.setSelectionCells(updatedCells); */
      } else if (
        cells !== null &&
        activeArrow !== null &&
        currentTargetState !== null &&
        activeArrow !== styleTarget
      ) {
        const index =
          graph.model.isEdge(currentTargetState.cell) || freeSourceEdge == null
            ? firstVertex
            : freeSourceEdge;
        /*  graph.setSelectionCells(
          this.dropAndConnect(
            currentTargetState.cell,
            cells,
            direction,
            index,
            evt
          )
        ); */
      } else {
        dropHandler.apply(this, arguments);
      }

      /* if (this.editorUi.hoverIcons !== null) {
        this.editorUi.hoverIcons.update(
          graph.view.getState(graph.getSelectionCell())
        );
      } */
    });

    const dragSource = mxUtils.makeDraggable(
      elt,
      graph,
      funt,
      preview,
      0,
      0,
      graph.autoscroll,
      true,
      true
    );

    dragSource.dragOver = function(graph, evt) {
      mxDragSource.prototype.dragOver.apply(this, arguments);
    };

    // Allows drop into cell only if target is a valid root
    dragSource.getDropTarget = mxUtils.bind(this, function(graph, x, y, evt) {
      // Alt means no targets at all
      // LATER: Show preview where result will go
      let cell =
        !mxEvent.isAltDown(evt) && cells !== null
          ? graph.getCellAt(x, y)
          : null;

      // Uses connectable parent vertex if one exists
      if (cell !== null && !graph.isCellConnectable(cell)) {
        const parent = graph.getModel().getParent(cell);

        if (
          graph.getModel().isVertex(parent) &&
          graph.isCellConnectable(parent)
        ) {
          cell = parent;
        }
      }

      // Ignores locked cells
      if (graph.isCellLocked(cell)) {
        cell = null;
      }

      const state = graph.view.getState(cell);
      activeArrow = null;
      let bbox = null;

      // Time on target
      if (prev !== state) {
        prev = state;
        startTime = new Date().getTime();
        timeOnTarget = 0;

        if (updateThread !== null) {
          window.clearTimeout(updateThread);
        }

        if (state !== null) {
          updateThread = window.setTimeout(function() {
            if (activeArrow == null) {
              prev = state;
              dragSource.getDropTarget(graph, x, y, evt);
            }
          }, dropTargetDelay + 10);
        }
      } else {
        timeOnTarget = new Date().getTime() - startTime;
      }

      // Shift means disabled, delayed on cells with children, shows after dropTargetDelay, hides after 2500ms
      if (
        dropStyleEnabled &&
        timeOnTarget < 2500 &&
        state !== null &&
        !mxEvent.isShiftDown(evt) &&
        // If shape is equal or target has no stroke, fill and gradient then use longer delay except for images
        ((mxUtils.getValue(state.style, mxConstants.STYLE_SHAPE) !==
          mxUtils.getValue(sourceCellStyle, mxConstants.STYLE_SHAPE) &&
          (mxUtils.getValue(
            state.style,
            mxConstants.STYLE_STROKECOLOR,
            mxConstants.NONE
          ) !== mxConstants.NONE ||
            mxUtils.getValue(
              state.style,
              mxConstants.STYLE_FILLCOLOR,
              mxConstants.NONE
            ) !== mxConstants.NONE ||
            mxUtils.getValue(
              state.style,
              mxConstants.STYLE_GRADIENTCOLOR,
              mxConstants.NONE
            ) !== mxConstants.NONE)) ||
          mxUtils.getValue(sourceCellStyle, mxConstants.STYLE_SHAPE) ==
            'image' ||
          timeOnTarget > 1500 ||
          graph.model.isEdge(state.cell)) &&
        timeOnTarget > dropTargetDelay &&
        !isDropStyleTargetIgnored(state) &&
        ((graph.model.isVertex(state.cell) && firstVertex !== null) ||
          (graph.model.isEdge(state.cell) && graph.model.isEdge(cells[0])))
      ) {
        currentStyleTarget = state;
        let tmp = graph.model.isEdge(state.cell)
          ? graph.view.getPoint(state)
          : new mxPoint(state.getCenterX(), state.getCenterY());
        tmp = new mxRectangle(
          tmp.x - this.refreshTarget.width / 2,
          tmp.y - this.refreshTarget.height / 2,
          this.refreshTarget.width,
          this.refreshTarget.height
        );

        styleTarget.style.left = Math.floor(tmp.x) + 'px';
        styleTarget.style.top = Math.floor(tmp.y) + 'px';

        if (styleTargetParent == null) {
          graph.container.appendChild(styleTarget);
          styleTargetParent = styleTarget.parentNode;
        }

        // checkArrow(x, y, tmp, styleTarget);
      }
      // Does not reset on ignored edges
      else if (
        currentStyleTarget == null ||
        !mxUtils.contains(currentStyleTarget, x, y) ||
        (timeOnTarget > 1500 && !mxEvent.isShiftDown(evt))
      ) {
        currentStyleTarget = null;

        if (styleTargetParent !== null) {
          styleTarget.parentNode.removeChild(styleTarget);
          styleTargetParent = null;
        }
      } else if (currentStyleTarget !== null && styleTargetParent !== null) {
        // Sets active Arrow as side effect
        const tmp = graph.model.isEdge(currentStyleTarget.cell)
          ? graph.view.getPoint(currentStyleTarget)
          : new mxPoint(
              currentStyleTarget.getCenterX(),
              currentStyleTarget.getCenterY()
            );
        tmp = new mxRectangle(
          tmp.x - this.refreshTarget.width / 2,
          tmp.y - this.refreshTarget.height / 2,
          this.refreshTarget.width,
          this.refreshTarget.height
        );
        checkArrow(x, y, tmp, styleTarget);
      }

      // Checks if inside bounds
      if (
        activeTarget &&
        currentTargetState !== null &&
        !mxEvent.isAltDown(evt) &&
        activeArrow == null
      ) {
        // LATER: Use hit-detection for edges
        bbox = mxRectangle.fromRectangle(currentTargetState);

        if (graph.model.isEdge(currentTargetState.cell)) {
          /* const pts = currentTargetState.absolutePoints;

          if (roundSource.parentNode !== null) {
            const p0 = pts[0];
            bbox.add(
              checkArrow(
                x,
                y,
                new mxRectangle(
                  p0.x - this.roundDrop.width / 2,
                  p0.y - this.roundDrop.height / 2,
                  this.roundDrop.width,
                  this.roundDrop.height
                ),
                roundSource
              )
            );
          }

          if (roundTarget.parentNode !== null) {
            const pe = pts[pts.length - 1];
            bbox.add(
              checkArrow(
                x,
                y,
                new mxRectangle(
                  pe.x - this.roundDrop.width / 2,
                  pe.y - this.roundDrop.height / 2,
                  this.roundDrop.width,
                  this.roundDrop.height
                ),
                roundTarget
              )
            );
          } */
        } else {
          let bds = mxRectangle.fromRectangle(currentTargetState);

          // Uses outer bounding box to take rotation into account
          if (
            currentTargetState.shape !== null &&
            currentTargetState.shape.boundingBox !== null
          ) {
            bds = mxRectangle.fromRectangle(
              currentTargetState.shape.boundingBox
            );
          }

          /* bds.grow(graph.tolerance);
          bds.grow(HoverIcons.prototype.arrowSpacing); */

          const handler = graph.selectionCellsHandler.getHandler(
            currentTargetState.cell
          );

          if (handler !== null) {
            /* bds.x -= handler.horizontalOffset / 2;
            bds.y -= handler.verticalOffset / 2;
            bds.width += handler.horizontalOffset;
            bds.height += handler.verticalOffset;

            // Adds bounding box of rotation handle to avoid overlap
            if (
              handler.rotationShape !== null &&
              handler.rotationShape.node !== null &&
              handler.rotationShape.node.style.visibility !== 'hidden' &&
              handler.rotationShape.node.style.display !== 'none' &&
              handler.rotationShape.boundingBox !== null
            ) {
              bds.add(handler.rotationShape.boundingBox);
            } */
          }

          /* bbox.add(
            checkArrow(
              x,
              y,
              new mxRectangle(
                currentTargetState.getCenterX() - this.triangleUp.width / 2,
                bds.y - this.triangleUp.height,
                this.triangleUp.width,
                this.triangleUp.height
              ),
              arrowUp
            )
          );
          bbox.add(
            checkArrow(
              x,
              y,
              new mxRectangle(
                bds.x + bds.width,
                currentTargetState.getCenterY() - this.triangleRight.height / 2,
                this.triangleRight.width,
                this.triangleRight.height
              ),
              arrowRight
            )
          );
          bbox.add(
            checkArrow(
              x,
              y,
              new mxRectangle(
                currentTargetState.getCenterX() - this.triangleDown.width / 2,
                bds.y + bds.height,
                this.triangleDown.width,
                this.triangleDown.height
              ),
              arrowDown
            )
          );
          bbox.add(
            checkArrow(
              x,
              y,
              new mxRectangle(
                bds.x - this.triangleLeft.width,
                currentTargetState.getCenterY() - this.triangleLeft.height / 2,
                this.triangleLeft.width,
                this.triangleLeft.height
              ),
              arrowLeft
            )
          ); */
        }

        // Adds tolerance
        if (bbox !== null) {
          bbox.grow(10);
        }
      }

      direction = mxConstants.DIRECTION_NORTH;

      /* if (activeArrow == arrowRight) {
        direction = mxConstants.DIRECTION_EAST;
      } else if (activeArrow == arrowDown || activeArrow == roundTarget) {
        direction = mxConstants.DIRECTION_SOUTH;
      } else if (activeArrow == arrowLeft) {
        direction = mxConstants.DIRECTION_WEST;
      } */

      if (currentStyleTarget !== null && activeArrow == styleTarget) {
        state = currentStyleTarget;
      }

      const validTarget =
        (firstVertex == null || graph.isCellConnectable(cells[firstVertex])) &&
        ((graph.model.isEdge(cell) && firstVertex !== null) ||
          (graph.model.isVertex(cell) && graph.isCellConnectable(cell)));

      // Drop arrows shown after dropTargetDelay, hidden after 5 secs, switches arrows after 500ms
      if (
        (currentTargetState !== null && timeOnTarget >= 5000) ||
        (currentTargetState !== state &&
          (bbox == null ||
            !mxUtils.contains(bbox, x, y) ||
            (timeOnTarget > 500 && activeArrow == null && validTarget)))
      ) {
        activeTarget = false;
        currentTargetState =
          (timeOnTarget < 5000 && timeOnTarget > dropTargetDelay) ||
          graph.model.isEdge(cell)
            ? state
            : null;

        if (currentTargetState !== null && validTarget) {
          const elts = [
            /* roundSource,
            roundTarget,
            arrowUp,
            arrowRight,
            arrowDown,
            arrowLeft, */
          ];

          for (const i = 0; i < elts.length; i++) {
            if (elts[i].parentNode !== null) {
              elts[i].parentNode.removeChild(elts[i]);
            }
          }

          if (graph.model.isEdge(cell)) {
            const pts = state.absolutePoints;

            if (pts !== null) {
              const p0 = pts[0];
              const pe = pts[pts.length - 1];
              const tol = graph.tolerance;
              const box = new mxRectangle(x - tol, y - tol, 2 * tol, 2 * tol);

              /* roundSource.style.left =
                Math.floor(p0.x - this.roundDrop.width / 2) + 'px';
              roundSource.style.top =
                Math.floor(p0.y - this.roundDrop.height / 2) + 'px';

              roundTarget.style.left =
                Math.floor(pe.x - this.roundDrop.width / 2) + 'px';
              roundTarget.style.top =
                Math.floor(pe.y - this.roundDrop.height / 2) + 'px';

              if (graph.model.getTerminal(cell, true) == null) {
                graph.container.appendChild(roundSource);
              }

              if (graph.model.getTerminal(cell, false) == null) {
                graph.container.appendChild(roundTarget);
              } */
            }
          } else {
            let bds = mxRectangle.fromRectangle(state);

            // Uses outer bounding box to take rotation into account
            if (state.shape !== null && state.shape.boundingBox !== null) {
              bds = mxRectangle.fromRectangle(state.shape.boundingBox);
            }

            /* bds.grow(graph.tolerance);
            bds.grow(HoverIcons.prototype.arrowSpacing); */

            const handler = graph.selectionCellsHandler.getHandler(state.cell);

            if (handler !== null) {
              /* bds.x -= handler.horizontalOffset / 2;
              bds.y -= handler.verticalOffset / 2;
              bds.width += handler.horizontalOffset;
              bds.height += handler.verticalOffset;

              // Adds bounding box of rotation handle to avoid overlap
                if (
                handler.rotationShape !== null &&
                handler.rotationShape.node !== null &&
                handler.rotationShape.node.style.visibility !== 'hidden' &&
                handler.rotationShape.node.style.display !== 'none' &&
                handler.rotationShape.boundingBox !== null
              ) {
                bds.add(handler.rotationShape.boundingBox);
              } */
            }

            /* arrowUp.style.left =
              Math.floor(state.getCenterX() - this.triangleUp.width / 2) + 'px';
            arrowUp.style.top =
              Math.floor(bds.y - this.triangleUp.height) + 'px';

            arrowRight.style.left = Math.floor(bds.x + bds.width) + 'px';
            arrowRight.style.top =
              Math.floor(state.getCenterY() - this.triangleRight.height / 2) +
              'px';

            arrowDown.style.left = arrowUp.style.left;
            arrowDown.style.top = Math.floor(bds.y + bds.height) + 'px';

            arrowLeft.style.left =
              Math.floor(bds.x - this.triangleLeft.width) + 'px';
            arrowLeft.style.top = arrowRight.style.top; */

            /* if (state.style['portConstraint'] !== 'eastwest') {
              graph.container.appendChild(arrowUp);
              graph.container.appendChild(arrowDown);
            }

            graph.container.appendChild(arrowRight);
            graph.container.appendChild(arrowLeft); */
          }

          // Hides handle for cell under mouse
          if (state !== null) {
            currentStateHandle = graph.selectionCellsHandler.getHandler(
              state.cell
            );

            if (
              currentStateHandle !== null &&
              currentStateHandle !== undefined &&
              currentStateHandle.setHandlesVisible !== null
            ) {
              currentStateHandle.setHandlesVisible(false);
            }
          }

          activeTarget = true;
        } else {
          const elts = [
            /* roundSource,
            roundTarget,
            arrowUp,
            arrowRight,
            arrowDown,
            arrowLeft, */
          ];

          for (const i = 0; i < elts.length; i++) {
            if (elts[i].parentNode !== null) {
              elts[i].parentNode.removeChild(elts[i]);
            }
          }
        }
      }

      if (
        !activeTarget &&
        currentStateHandle !== null &&
        currentStateHandle !== undefined
      ) {
        currentStateHandle.setHandlesVisible(true);
      }

      // Handles drop target
      let target =
        (!mxEvent.isAltDown(evt) || mxEvent.isShiftDown(evt)) &&
        !(currentStyleTarget !== null && activeArrow == styleTarget)
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

  const createDropHandler = (cells, allowSplit, allowCellsInserted, bounds) => {
    const allowCellsInsertedValue =
      allowCellsInserted !== null ? allowCellsInserted : true;

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
