export const goHandleUndo = (
  graph,
  undoAndRedoRefCurrent,
  updateGraphDataAction
) => {
  graph.refresh();
  const undo_s = undoAndRedoRefCurrent.undoSteps;
  const redo_s = undoAndRedoRefCurrent.redoSteps;

  // 假如undo_s列表中没有数据，则不运行
  if (undo_s.length < 1) return;

  // 取数组最后一个操作集合array[]
  let undoStepArray = [...undo_s[undo_s.length - 1]];
  let needPush = false;
  let goBackTimeMachine = []; // 时光倒流操作集

  // 假如是插入元素，则插入之后会触发一次移动，所以要把那个操作去掉,并把对应的数据搬过去
  if (undo_s.length >= 2) {
    if (
      undoStepArray[0].type === 'move'  &&
      //|| undoStepArray[0].type === 'cellsAdded' &&
      [...undo_s[undo_s.length - 2]][0].type === 'cellsAdded'
    ) {
      // 1. 把 move 中的id取出来
      //let temp = undoStepArray.map(cell=>cell.change.id);
      // 2. 移除 move
      undo_s.pop();
      // 3. 更新 当前操作的步骤
      undoStepArray = [...undo_s[undo_s.length - 1]];
      // 4. 把temp中的id全部替换到当前对应位置
      // temp.forEach((id, index)=>{
      //   undoStepArray[index].change.id = id
      // })
    }
  }

  if(undoStepArray.length === 0) return undo_s.pop();

  undoStepArray.forEach(undoStep => {
    // 假如是 移动操作
    if (undoStep.type === 'move') {
      graph.moveCells(
        [undoStep.change.cell],
        -undoStep.change.geometry.dx,
        -undoStep.change.geometry.dy
      );
      undo_s.pop(); // 移除掉移动引发的撤销新增
      needPush = true;
    }

    // 假如是 连线操作
    if (undoStep.type === 'connectLine') {
      console.log(undoStepArray[0]);
      graph.removeCells([undoStepArray[0].change.line_cell]);
      //undoStepArray[0].type = 'removeLine';
      //undoStepArray[0].change
      needPush = true;
      updateGraphDataAction(graph);
      undo_s.pop(); // 移除掉删除引发的撤销新增
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
        graph.insertVertex(
          graph.getDefaultParent(),
          undoStep.change.id,
          undoStep.change.value,
          undoStep.change.geometry.x,
          undoStep.change.geometry.y,
          undoStep.change.geometry.width,
          undoStep.change.geometry.height,
          undoStep.change.style,
          false
        );
      } else {
        graph.insertEdge(
          graph.getDefaultParent(),
          undoStep.change.id,
          undoStep.change.value,
          graph.getModel().getCell(undoStep.change.source_id),
          graph.getModel().getCell(undoStep.change.target_id),
          ''
        );
        undo_s.pop();
      }
      needPush = true;
      updateGraphDataAction(graph);
    }

    if (
      undoStep.type === 'cellsAdded'
      // || undoStep.type === 'cellsAdded_By_redo'
    ) {
      if (!undoStep.change.vertex) return;
      let needDelete = graph.getModel().getCell(undoStep.change.id);
      console.log('cellsAdded',"要被删了",undoStep,needDelete)
      if (!needDelete){
        needDelete = undoStep.change.cell;
        if(!needDelete) return;
      }
      graph.removeCells([needDelete]);
      undo_s.pop();
      needPush = true;
      updateGraphDataAction(graph);
    }
  });

  // 移除这个操作集合array[]
  undo_s.pop();

  // 假如撤销了，则放入恢复池
  undoStepArray.counter = undoAndRedoRefCurrent.counter;

  if (needPush) redo_s.push(undoStepArray);

  console.log('撤销后的', undo_s, redo_s, undoAndRedoRefCurrent.counter);
};

export const goHandleRedo = (
  graph,
  undoAndRedoRefCurrent,
  updateGraphDataAction
) => {
  console.log(undoAndRedoRefCurrent);
  const undo_s = undoAndRedoRefCurrent.undoSteps;
  const redo_s = undoAndRedoRefCurrent.redoSteps;

  if (redo_s.length < 1) return;



  let redoStepArray = redo_s[redo_s.length - 1];
  let needPush = false;
  if (undoAndRedoRefCurrent.counter > redoStepArray.counter) {
    return (undoAndRedoRefCurrent.redoSteps = []);
  }

  if(redoStepArray.length === 0) return undo_s.pop();
  // 假如恢复了，则放入撤销池

  redoStepArray.forEach((redoStep, index) => {
    if (redoStep.type === 'move') {
      graph.moveCells(
        [redoStep.change.cell],
        redoStep.change.geometry.dx,
        redoStep.change.geometry.dy
      );
      undo_s.pop();
      needPush = true;
    }

    if (redoStep.type === 'connectLine') {
      //parent画板父层，线条id,value连线值，source起点，target重点，style样式
      graph.insertEdge(
        graph.getDefaultParent(),
        redoStep.change.line_id,
        redoStep.change.value,
        redoStep.change.source_cell,
        redoStep.change.target_cell,
        ''
      );
      updateGraphDataAction(graph);
    }

    if (redoStep.type === 'remove') {
      const needDelete = graph.getModel().getCell(redoStep.change.id);
      if (!needDelete) return;
      graph.removeCells([needDelete]);
      undo_s.pop();
      needPush = true;
      updateGraphDataAction(graph);
    }

    if (
      redoStep.type === 'cellsAdded'
      // || redoStep.type === 'cellsAdded_By_redo'
    ) {
      //redoStepArray[index].type = 'cellsAdded_By_redo'
      console.log('我开始恢复了！',redoStep);

      if(redoStepArray.length !== 1){
        console.log('\n\n\n\细致研究这里面的过程',redoStep);
        if (redoStep.change.vertex) {
          graph.insertVertex(
            graph.getDefaultParent(),
            redoStep.change.id,
            redoStep.change.value,
            redoStep.change.geometry.x,
            redoStep.change.geometry.y,
            redoStep.change.geometry.width,
            redoStep.change.geometry.height,
            redoStep.change.style,
            false
          );
          undo_s.pop();
        }
        return;
      }

      if (redoStep.change.vertex) {
        graph.insertVertex(
          graph.getDefaultParent(),
          redoStep.change.id,
          redoStep.change.value,
          redoStep.change.geometry.x,
          redoStep.change.geometry.y,
          redoStep.change.geometry.width,
          redoStep.change.geometry.height,
          redoStep.change.style,
          false
        );
        //undo_s.pop();
      } else {
        graph.insertEdge(
          graph.getDefaultParent(),
          redoStep.change.id,
          redoStep.change.value,
          graph.getModel().getCell(redoStep.change.source_id),
          graph.getModel().getCell(redoStep.change.target_id),
          ''
        );
        undo_s.pop();
      }
      needPush = true;
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
};
