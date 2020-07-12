import {
  mxPoint as MxPonint,
  mxRectangleShape,
  mxConnectionConstraint as MxConnectionConstraint,
  mxRhombus,
  mxSwimlane,
  mxShape,
  mxGraph,
  mxUtils,
  mxConstants,
  mxConstraintHandler,
  mxClient,
  mxImage as MxImage,
} from 'mxgraph-js';

export default () => {
  // 创建连接点图像
  mxConstraintHandler.prototype.pointImage = new MxImage(
    'containers/images/point.gif',
    5,
    5
  );

  // 设置长方形形状hover时会出现的连线点
  mxRectangleShape.prototype.constraints = [
    new MxConnectionConstraint(new MxPonint(0.5, 0), true),
    new MxConnectionConstraint(new MxPonint(0, 0.5), true),
    new MxConnectionConstraint(new MxPonint(1, 0.5), true),
    new MxConnectionConstraint(new MxPonint(0.5, 1), true),
  ];

  // 设置判断形状hover时出现的连接点
  mxRhombus.prototype.constraints = [
    new MxConnectionConstraint(new MxPonint(0.5, 0), true),
    new MxConnectionConstraint(new MxPonint(0.5, 1), true),
    new MxConnectionConstraint(new MxPonint(0, 0.5), true),
    new MxConnectionConstraint(new MxPonint(1, 0.5)),
  ];

  // 设置容器形状hover时出现的连接点----泳道
  mxSwimlane.prototype.constraints = [
    new MxConnectionConstraint(new MxPonint(0.5, 0), true),
    new MxConnectionConstraint(new MxPonint(0, 0.5), true),
    new MxConnectionConstraint(new MxPonint(1, 0.5), true),
    new MxConnectionConstraint(new MxPonint(0.5, 1), true),
  ];

  // 重写方法为形状提供链接点
  mxGraph.prototype.getAllConnectionConstraints = function(terminal) {
    if (terminal != null) {
      let constraints = mxUtils.getValue(terminal.style, 'points', null);

      if (constraints != null) {
        // Requires an array of arrays with x, y (0..1), an optional
        // [perimeter (0 or 1), dx, and dy] eg. points=[[0,0,1,-10,10],[0,1,0],[1,1]]
        const result = [];

        try {
          const c = JSON.parse(constraints);

          for (let i = 0; i < c.length; i += 1) {
            const tmp = c[i];
            result.push(
              new MxConnectionConstraint(
                new MxPonint(tmp[0], tmp[1]),
                tmp.length > 2 ? tmp[2] !== '0' : true,
                null,
                tmp.length > 3 ? tmp[3] : 0,
                tmp.length > 4 ? tmp[4] : 0
              )
            );
          }
        } catch (e) {
          console.log(e);
        }

        return result;
      } else if (terminal.shape != null && terminal.shape.bounds != null) {
        const dir = terminal.shape.direction;
        const { bounds } = terminal.shape;
        const { scale } = terminal.shape;
        let w = bounds.width / scale;
        let h = bounds.height / scale;

        if (
          dir === mxConstants.DIRECTION_NORTH ||
          dir === mxConstants.DIRECTION_SOUTH
        ) {
          const tmp = w;
          w = h;
          h = tmp;
        }

        constraints = terminal.shape.getConstraints(terminal.style, w, h);

        if (constraints != null) {
          return constraints;
        } else if (
          terminal.shape.stencil != null &&
          terminal.shape.stencil.constraints != null
        ) {
          return terminal.shape.stencil.constraints;
        } else if (terminal.shape.constraints != null) {
          return terminal.shape.constraints;
        }
      }
    }

    return null;
  };

  // 自定义链接点的钩子
  mxShape.prototype.getConstraints = function() {
    return null;
  };
};
