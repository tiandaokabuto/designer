export const PROCESS_NODE = {
  getLabel: str => `<div class='compoent-content'>${str}</div>`,
  label: '<div class="compoent-content">流程块</div>',
  style:
    'label;whiteSpace=wrap;html=1;resizable=0;shadow=1;rounded=1;fillColor=#F2FAF7;strokeColor=#32A67F;gradientColor=none;fontColor=#000000;', //image=../../../../images/icon.jpg',
  width: 96,
  height: 48,
};

export const CONDITION_NODE = {
  getLabel: str =>
    `<div class='rcomponent-content'><label class='rcomponent-content-icon'></label><span class='rcomponent-name' title='condition'>${str}</span></div>`,
  label:
    "<div class='rcomponent-content'><label class='rcomponent-content-icon'></label><span class='rcomponent-name' title='condition'>判断</span></div>",
  style: 'shape=rhombus;perimeter=ellipsePerimeter;resizable=0;shadow=1;',
  width: 100,
  height: 100,
};

export const START_NODE = {
  label: '开始',
  style:
    'shape=ellipse;label;whiteSpace=wrap;html=1;resizable=0;align=center;shadow=1;',
  width: 50,
  height: 50,
};

export const END_NODE = {
  label: '<span>结束</span>',
  style:
    'ellipse;shape=doubleEllipse;label;whiteSpace=wrap;html=1;;resizable=0;align=center;shadow=1;',
  width: 80,
  height: 55,
};

export const GROUP_NODE = {
  getLabel: str => `<span class='group-content'>${str}</span>`,
  label: "<span class='group-content'>for in</span>",
  style:
    'group;html=1;whiteSpace=wrap;container=1;recursiveResize=0;collapsible=0;shadow=1;',
  width: 286,
  height: 402,
};

export const TRY_NODE = {
  label: 'contain',
  style:
    'group;html=1;whiteSpace=wrap;container=1;recursiveResize=0;collapsible=0;shadow=1;',
  width: 286,
  height: 402,
};

export const BREAK_NODE = {
  label: '跳出循环',
  style:
    'shape=hexagon;whiteSpace=wrap;align=centerhtml=1;resizable=0;shadow=1;',
  width: 186,
  height: 55,
};

export const CONTINUE_NODE = {
  label: '继续循环',
  style:
    'shape=hexagon;whiteSpace=wrap;align=centerhtml=1;resizable=0;shadow=1;',
  width: 186,
  height: 55,
};
