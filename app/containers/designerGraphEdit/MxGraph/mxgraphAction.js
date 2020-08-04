import mxgraph from './mxgraph';

const { mxEventObject } = mxgraph;

// export const addCellAction = graph => {
//   graph.fireEvent(new mxEventObject('add_cell'));
//   updateGraphDataAction(graph);
// };

// export const moveCellAction = graph => {
//   graph.fireEvent(new mxEventObject('move_cell'));
//   updateGraphDataAction(graph);
// };

export const deleteCellAction = graph => {
  graph.fireEvent(new mxEventObject('delete_cells'));
  updateGraphDataAction(graph);
};

export const updateGraphDataAction = graph => {
  graph.fireEvent(new mxEventObject('update_graphData'));
};
