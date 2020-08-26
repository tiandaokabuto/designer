import { message } from 'antd';

// 从mxGraph里面强制删除元素
export const deleteFromMxModel = (id, graph) => {
  Object.keys(graph.model.cells).forEach(mxIndex => {
    console.log(graph.model.cells[mxIndex].id);
    if (graph.model.cells[mxIndex].id === id) delete graph.model.cells[mxIndex];
  });
};

// 用我们的id找到那个cell
export const find_id = (id, graph) => {
  const model = graph.getModel();
  let temp = {};
  for (const [key, item] of Object.entries(model.cells)) {
    if (item.id === id) {
      temp = item;
    }
  }
  console.log(temp);
  return temp;
};

export const goHandleUndo = (
  graph,
  undoAndRedoRefCurrent,
  updateGraphDataAction
) => {
  setTimeout(
    goHandleUndo_real,
    20,
    graph,
    undoAndRedoRefCurrent,
    updateGraphDataAction
  );
};

function goHandleUndo_real(
  graph,
  undoAndRedoRefCurrent,
  updateGraphDataAction
) {
  graph.refresh();
  const undo_s = undoAndRedoRefCurrent.undoSteps;
  const redo_s = undoAndRedoRefCurrent.redoSteps;

  // 假如undo_s列表中没有数据，则不运行
  if (undo_s.length < 1) return;

  // 取数组最后一个操作集合array[]
  let undoStepArray = [...undo_s[undo_s.length - 1]];
  let needPush = false;
  let goBackTimeMachine = []; // 时光倒流操作集

  // if (redo_s.length > 0) {
  //   if (undoAndRedoRefCurrent.counter > redo_s[redo_s.length - 1][0].counter) {
  //     undoAndRedoRefCurrent.redoSteps = [];
  //   }
  // }

  // 假如是插入元素，则插入之后会触发一次移动，所以要把那个操作去掉,并把对应的数据搬过去
  // if (undo_s.length >= 2) {
  //   if (
  //     undoStepArray[0].type === 'cellsAdded' &&
  //     //|| undoStepArray[0].type === 'cellsAdded' &&
  //     [...undo_s[undo_s.length - 2]][0].type === 'move'
  //   ) {
  //     // 1. 把 move 中的id取出来
  //     //let temp = undoStepArray.map(cell=>cell.change.id);
  //     //delete undo_s[undo_s.length - 2];
  //     undo_s[undo_s.length - 2] = undo_s[undo_s.length - 1];
  //     // 2. 移除 move
  //     //undo_s.pop();
  //     // 3. 更新 当前操作的步骤
  //     undoStepArray = [...undo_s[undo_s.length - 1]];
  //     // 4. 把temp中的id全部替换到当前对应位置
  //     // temp.forEach((id, index)=>{
  //     //   undoStepArray[index].change.id = id
  //     // })
  //   }
  // }

  if (undoStepArray.length === 0) return undo_s.pop();

  undoStepArray.forEach((undoStep, index) => {
    // 假如是 移动操作
    if (undoStep.type === 'move') {
      graph.moveCells(
        [find_id(undoStep.change.id, graph)],
        -undoStep.change.geometry.dx,
        -undoStep.change.geometry.dy
      );

      undo_s.pop(); // 移除掉移动引发的撤销新增
      needPush = true;

      updateGraphDataAction(graph);
    }

    if (undoStep.type === 'moveParent') {
      //console.clear();
      console.log(`父子移动`, undoStep);
      console.log(`[密切关注]1 `, undo_s, find_id(undoStep.change.id, graph));
      graph.removeCells([find_id(undoStep.change.id, graph)]);
      console.log(
        `[密切关注]2 removeCells后`,
        undo_s,
        find_id(undoStep.change.parent_id, graph)
      );
      //undo_s.pop(); // 移除掉移动引发的撤销新增

      graph.insertVertex(
        undoStep.change.parent
          ? find_id(undoStep.change.parent_id, graph)
          : graph.getDefaultParent(),
        undoStep.change.id,
        undoStep.change.value,
        undoStep.change.geometry.parent_x,
        undoStep.change.geometry.parent_y,
        undoStep.change.geometry.width,
        undoStep.change.geometry.height,
        undoStep.change.style,
        false
      );
      console.log(`[密切关注]3 insertVertex 后`, undo_s);
      undo_s.pop(); // 移除掉移动引发的撤销新增

      needPush = true;

      graph.refresh();
      updateGraphDataAction(graph);
    }

    // 假如是 连线操作
    if (undoStep.type === 'connectLine') {
      console.log(undoStepArray[0]);

      graph.removeCells([undoStepArray[0].change.line_cell]);
      //undoStepArray[0].type = 'removeLine';
      //undoStepArray[0].change
      needPush = true;
      undo_s.pop(); // 移除掉删除引发的撤销新增

      updateGraphDataAction(graph);
    }

    // 假如是删除操作
    if (undoStep.type === 'remove') {
      if (undoStep.change.vertex) {
        //假如是块
        // mxGraph.prototype.insertVertex = function(	parent,
        //   id,
        //   value,
        //   x,
        //   y,
        //   width,
        //   height,
        //   style,
        //   relative	)

        if (undoStep.change.value === '异常捕获') {
          // Todo 恢复try Catch
          setTimeout(() => {
            // const importableCells = graph.getImportableCells(cells);
            // const toolCells = document.querySelectorAll('.mxgraph-cell');
            // const elt = toolCells[3];
            // const { label, style, width, height } = elt.dataset;
            // const cell = new MxCell(
            //   label,
            //   new MxGeometry(0, 0, parseInt(width, 10), parseInt(height, 10)),
            //   style
            // );

            // select = graph.importCells(importableCells, x, y, target);
            //console.clear();
            console.log(undoStep.change.cell);

            if (!undoStep.change.children) return;

            graph.insertVertex(
              //undoStep.parent ? undoStep.parent : graph.getDefaultParent(),
              undoStep.change.parent
                ? find_id(undoStep.change.parent_id, graph)
                : graph.getDefaultParent(),
              undoStep.change.id,
              undoStep.change.value,
              undoStep.change.geometry.x,
              undoStep.change.geometry.y,
              undoStep.change.geometry.width,
              undoStep.change.geometry.height,
              undoStep.change.style,
              false
            );

            setTimeout(() => {
              const newCell = find_id(undoStep.change.id, graph);
              console.log(`要插回去的`, undoStep.change.children[0]);

              newCell.insert(undoStep.change.children[0]);
              updateGraphDataAction(graph);

              setTimeout(() => {
                const newCell = find_id(undoStep.change.id, graph);
                console.log(`要插回去的`, undoStep.change.children[1]);
                newCell.insert(undoStep.change.children[1]);
                graph.refresh();
                updateGraphDataAction(graph);
              }, 0);
              //newCell.insert(undoStep.change.cell.children[1]);
            }, 0);

            updateGraphDataAction(graph);
          }, 0);
        } else {
          setTimeout(() => {
            //console.clear();
            console.log(undoStep, undoStep.change.parent);
            graph.insertVertex(
              // undoStep.change.parent
              //   ? undoStep.change.parent
              //   : graph.getDefaultParent(),
              undoStep.change.parent
                ? find_id(undoStep.change.parent_id, graph)
                : graph.getDefaultParent(),
              undoStep.change.id,
              undoStep.change.value,
              undoStep.change.geometry_parent.parent_x,
              undoStep.change.geometry_parent.parent_y,
              undoStep.change.geometry.width,
              undoStep.change.geometry.height,
              undoStep.change.style,
              false
            );
            updateGraphDataAction(graph);
            if (undoStep.change.parent_id !== '1') {
              undo_s.pop();
              undoAndRedoRefCurrent.counter -= 1;
            }
          }, 0);
        }
      } else {
        setTimeout(() => {
          graph.insertEdge(
            graph.getDefaultParent(),
            undoStep.change.id,
            undoStep.change.value,
            find_id(undoStep.change.source_id, graph),
            find_id(undoStep.change.target_id, graph),
            ''
          );
          undo_s.pop();
          updateGraphDataAction(graph);
        }, 0);
      }
      needPush = true;
      updateGraphDataAction(graph);
    }

    if (undoStep.type === 'cellsAdded_By_redo') {
      needPush = true;

      graph.removeCells([find_id(undoStep.change.id, graph)]);
      deleteFromMxModel(undoStep.change.id, graph); //从mxGraph的Model里面删掉
      undo_s.pop();
      //undoAndRedoRefCurrent.counter -= 1;
      updateGraphDataAction(graph);
    }

    if (undoStep.type === 'cellsAdded') {
      needPush = true;

      //undo_s.pop();

      graph.removeCells([find_id(undoStep.change.id, graph)]);
      deleteFromMxModel(undoStep.change.id, graph); //从mxGraph的Model里面删掉
      undo_s.pop();
      //undoAndRedoRefCurrent.counter -= 1;
      undoStepArray[index].type = 'cellsAdded_By_redo';
      updateGraphDataAction(graph);
    }
  });

  // 移除这个操作集合array[]
  undo_s.pop();

  // 假如撤销了，则放入恢复池
  undoStepArray.counter = undoAndRedoRefCurrent.counter;

  if (needPush) redo_s.push(undoStepArray);

  console.log('撤销后的', undo_s, redo_s, undoAndRedoRefCurrent.counter);
  updateGraphDataAction(graph);
}

export const goHandleRedo = (
  graph,
  undoAndRedoRefCurrent,
  updateGraphDataAction
) => {
  setTimeout(
    goHandleRedo_real,
    20,
    graph,
    undoAndRedoRefCurrent,
    updateGraphDataAction
  );
};

function goHandleRedo_real(
  graph,
  undoAndRedoRefCurrent,
  updateGraphDataAction
) {
  console.log(undoAndRedoRefCurrent);
  const undo_s = undoAndRedoRefCurrent.undoSteps;
  const redo_s = undoAndRedoRefCurrent.redoSteps;

  if (redo_s.length < 1) return;

  let redoStepArray = redo_s[redo_s.length - 1];
  let needPush = false;
  if (undoAndRedoRefCurrent.counter > redoStepArray.counter) {
    message.error('做了新动作后不能恢复');
    return (undoAndRedoRefCurrent.redoSteps = []);
  }

  if (redoStepArray.length === 0) return redo_s.pop();
  // 假如恢复了，则放入撤销池

  redoStepArray.forEach((redoStep, index) => {
    if (redoStep.type === 'move') {
      graph.moveCells(
        //[redoStep.change.cell],
        [find_id(redoStep.change.id, graph)],
        redoStep.change.geometry.dx,
        redoStep.change.geometry.dy
      );
      undo_s.pop();
      needPush = true;
    }

    if (redoStep.type === 'moveParent') {
      //console.clear();
      console.log(`父子移动`, redoStep);

      const needDeleteCell = find_id(redoStep.change.id, graph);
      console.log('不执行操作?', needDeleteCell);
      if (needDeleteCell.children) {
        if (needDeleteCell.children.children) {
          console.log('不执行操作');
          return (needPush = false);
        }
      }

      graph.removeCells([find_id(redoStep.change.id, graph)]);
      //undo_s.pop(); // 移除掉移动引发的撤销新增

      graph.insertVertex(
        redoStep.change.parent
          ? find_id(redoStep.change.toId, graph)
          : graph.getDefaultParent(),
        redoStep.change.id,
        redoStep.change.value,
        redoStep.change.toId_cellGeometry.x,
        redoStep.change.toId_cellGeometry.y,
        redoStep.change.geometry.width,
        redoStep.change.geometry.height,
        redoStep.change.style,
        false
      );

      undo_s.pop(); // 移除掉移动引发的撤销新增
      needPush = true;

      updateGraphDataAction(graph);
      graph.refresh();
    }

    if (redoStep.type === 'connectLine') {
      //parent画板父层，线条id,value连线值，source起点，target重点，style样式

      setTimeout(() => {
        graph.insertEdge(
          graph.getDefaultParent(),
          redoStep.change.line_id,
          redoStep.change.value,
          find_id(redoStep.change.source_id, graph),
          find_id(redoStep.change.target_id, graph)
        );

        updateGraphDataAction(graph);
      }, 0);
    }

    if (redoStep.type === 'remove') {
      needPush = true;
      graph.removeCells([find_id(redoStep.change.id, graph)]);
      deleteFromMxModel(redoStep.change.id, graph);
      undo_s.pop(redoStep.change.id, graph);
      updateGraphDataAction(graph);
    }

    if (redoStep.type === 'cellsAdded_By_redo') {
      needPush = true;

      if (redoStep.change.vertex) {
        if (redoStep.change.value === '异常捕获') {
          // Todo 恢复try Catch
          setTimeout(() => {
            // const importableCells = graph.getImportableCells(cells);
            // const toolCells = document.querySelectorAll('.mxgraph-cell');
            // const elt = toolCells[3];
            // const { label, style, width, height } = elt.dataset;
            // const cell = new MxCell(
            //   label,
            //   new MxGeometry(0, 0, parseInt(width, 10), parseInt(height, 10)),
            //   style
            // );

            // select = graph.importCells(importableCells, x, y, target);
            //console.clear();
            console.log(redoStep.change.cell);

            if (!redoStep.change.children) return;

            graph.insertVertex(
              //redoStep.parent ? redoStep.parent : graph.getDefaultParent(),
              redoStep.change.parent
                ? find_id(redoStep.change.parent_id, graph)
                : graph.getDefaultParent(),
              redoStep.change.id,
              redoStep.change.value,
              redoStep.change.geometry.x,
              redoStep.change.geometry.y,
              redoStep.change.geometry.width,
              redoStep.change.geometry.height,
              redoStep.change.style,
              false
            );

            setTimeout(() => {
              const newCell = find_id(redoStep.change.id, graph);
              console.log(`要插回去的`, redoStep.change.children[0]);

              newCell.insert(redoStep.change.children[0]);
              updateGraphDataAction(graph);

              setTimeout(() => {
                const newCell = find_id(redoStep.change.id, graph);
                console.log(`要插回去的`, redoStep.change.children[1]);
                newCell.insert(redoStep.change.children[1]);
                graph.refresh();
                updateGraphDataAction(graph);
              }, 0);
              //newCell.insert(undoStep.change.cell.children[1]);
            }, 0);

            updateGraphDataAction(graph);
          }, 0);
        } else {
          graph.insertVertex(
            //graph.getDefaultParent(),
            redoStep.change.parent
              ? find_id(redoStep.change.parent_id, graph)
              : graph.getDefaultParent(),
            redoStep.change.id,
            redoStep.change.value,
            redoStep.change.geometry.x,
            redoStep.change.geometry.y,
            redoStep.change.geometry.width,
            redoStep.change.geometry.height,
            redoStep.change.style,
            false
          );
          needPush = true;
          //undo_s.push(redoStepArray);
        }

        //undo_s.pop();
      }

      updateGraphDataAction(graph);
    }
  });

  redoStepArray.counter = undoAndRedoRefCurrent.counter;
  if (needPush) undo_s.push(redoStepArray);

  redo_s.pop();

  if (redo_s.length >= 1) {
    redo_s[redo_s.length - 1].counter = undoAndRedoRefCurrent.counter;
  }

  console.log('恢复后的', undo_s, redo_s, undoAndRedoRefCurrent.counter);
  updateGraphDataAction(graph);
}
