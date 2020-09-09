/*
 * 转换逻辑：
 * 需要把mxCell转换GgEditor原版的点，线，块
 */

export function translateToGraphData(sender, graph) {
  //console.clear();
  // console.log(`[liuqi] action/translateToGraphData.js 将要被转换的`, sender);

  const view = graph.getView();
  const { cells } = sender;
  if (cells.length <= 2) return false;

  let output = { nodes: [], edges: [], translate: {} };

  Object.keys(cells).map((key, index) => {
    if (index < 2) return;
    if (cells[key].isVertex()) {
      const { style, value, geometry, id, parent } = cells[key];
      // 根据style和value判断这个cell是什么类型的
      const shape = getShape(style, value);

      console.log(shape);

      let label = '';

      if (shape === 'label') {
        label = value
          .replace(
            "<div class='compoent-content'><label class='component-icon'></label><span class='component-name' title='process'>",
            ''
          )
          .replace('</span></div>', '');
      } else if (shape === 'rhombus') {
        label = value
          .replace(
            "<div class='rcomponent-content'><label class='rcomponent-content-icon'></label><span class='rcomponent-name' title='condition'>",
            ''
          )
          .replace('</span></div>', '');
      } else if (shape === 'group') {
        label = value
          .replace("<span class='group-content'>", '')
          .replace('</span>', '');
      } else {
        label = value;
      }

      //console.log(cells[key].geometry);

      output.nodes.push({
        parent: parent ? (parent.id ? parent.id : '1') : '1',
        type: 'node',
        size:
          shape === 'start' || shape === 'end'
            ? '40*40'
            : `${geometry.width}*${geometry.height}`,
        shape: getMeanShape(shape),
        newStyle: style, // 新版Style
        //style: { stroke: "rgba(61, 109, 204, 1)", fill: "#ecf5f6" }, // 兼容旧版用，没实际意义
        //style: style,
        //color:
        // label: value, // 新增 value
        label, // 队value进行处理
        x: geometry.x,
        y: geometry.y,
        id,
        index: id,
        version: 'mxgraph',
      });
    } else {
      const { style, value, source, target, id } = cells[key];

      // 由于监听会触发两次，只有后面那次有target，所以假如没有target则还没生成连线，不写入数组
      if (!target) return;

      output.edges.push({
        source: source.id,
        //sourceAnchor: 2,
        style: style, // 新增 出入点位置
        target: target.id,
        //targetAnchor: 3,
        id,
        label: value,
        index: id,
      });
    }
  });

  output.translate = {
    x: view.translate.x,
    y: view.translate.y,
  };

  // console.log(`[liuqi] action/translateToGraphData.js 转换后的`, output);

  return output;
}

// 获取组件类型
function getShape(style, value) {
  // 开始，流程，判断，容器
  const typeList = ['ellipse', 'label', 'rhombus', 'group'];
  let type = false;

  if (value === '开始') return 'start';
  if (value === '<span>结束</span>') return 'end';
  if (value === '异常捕获') return 'try';
  if (value === '异常处理') return 'catch';
  if (value === '结束') return 'finally';
  if (value.indexOf('group-content') > -1) return 'group';
  if (value === '跳出循环') return 'break';
  if (value === '继续循环') return 'continue';

  typeList.forEach(shape => {
    if (style.indexOf(`${shape}`) !== -1) {
      type = shape;
    }
  });
  return type;
}

// 转义为原来定义的shape
function getMeanShape(name) {
  switch (name) {
    case 'start':
      return 'start-node';
    case 'end':
      return 'end-node';
    case 'label':
      return 'processblock';
    case 'rhombus':
      return 'rhombus-node';
    case 'group':
      return 'group';
    case 'try':
      return 'try';
    case 'catch':
      return 'catch';
    case 'finally':
      return 'finally';
    case 'break':
      return 'break-node';
    case 'continue':
      return 'continue-node';
  }
}
