import mx from 'mxgraph';

const mxgraph = mx({
  mxImageBasePath: './containers/images',
  mxBasePath: './constants',
});

mxgraph.mxUtils.alert = () => {};

// decode bug https://github.com/jgraph/mxgraph/issues/49
window.mxGraph = mxgraph.mxGraph;
window.mxGraphModel = mxgraph.mxGraphModel;
window.mxEditor = mxgraph.mxEditor;
window.mxGeometry = mxgraph.mxGeometry;
window.mxDefaultKeyHandler = mxgraph.mxDefaultKeyHandler;
window.mxDefaultPopupMenu = mxgraph.mxDefaultPopupMenu;
window.mxStylesheet = mxgraph.mxStylesheet;
window.mxDefaultToolbar = mxgraph.mxDefaultToolbar;

// mx剪切板
window.mxClipboard = mxgraph.mxClipboard;

export default mxgraph;
