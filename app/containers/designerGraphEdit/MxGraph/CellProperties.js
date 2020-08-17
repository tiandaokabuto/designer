export const PROCESS_NODE = {
  getLabel: str =>
    `<div class='compoent-content'><label class='component-icon'></label><span class='component-name' title='process'>${str}</span></div>`,
  label:
    "<div class='compoent-content'><label class='component-icon'></label><span class='component-name' title='process'>流程块</span></div>",
  style: 'label;whiteSpace=wrap;html=1;;resizable=0;', //image=../../../../images/icon.jpg',
  width: 186,
  height: 55,
};

export const CONDITION_NODE = {
  getLabel: str =>
    `<div class='rcomponent-content'><label class='rcomponent-content-icon'></label><span class='rcomponent-name' title='condition'>${str}</span></div>`,
  label:
    "<div class='rcomponent-content'><label class='rcomponent-content-icon'></label><span class='rcomponent-name' title='condition'>判断</span></div>",
  style: 'shape=rhombus;perimeter=ellipsePerimeter;resizable=0;',
  width: 100,
  height: 100,
};

export const START_NODE = {
  label: '开始',
  style: 'shape=ellipse;label;whiteSpace=wrap;html=1;resizable=0;align=center;',
  width: 50,
  height: 50,
};

export const END_NODE = {
  label: '结束',
  style:
    'ellipse;shape=doubleEllipse;label;whiteSpace=wrap;html=1;;resizable=0;align=center;',
  width: 80,
  height: 55,
};

export const GROUP_NODE = {
  getLabel: str => `<span class='group-content'>${str}</span>`,
  label: "<span class='group-content'>for in</span>",
  style:
    'group;html=1;whiteSpace=wrap;container=1;recursiveResize=0;collapsible=0;',
  width: 286,
  height: 402,
};

export const TRY_NODE = {
  label: 'contain',
  style:
    'group;html=1;whiteSpace=wrap;container=1;recursiveResize=0;collapsible=0;',
  width: 286,
  height: 402,
};
