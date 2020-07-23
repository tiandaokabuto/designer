export const PROCESS_NODE = {
  label:
    "<div class='compoent-content'><label class='component-icon'></label><span class='component-name' title='process'>流程块</span></div>",
  style:
    'label;whiteSpace=wrap;html=1;;resizable=0;',//image=../../../../images/icon.jpg',
  width: 186,
  height: 55,
};

export const CONDITION_NODE = {
  label:
    "<div class='rcomponent-content'><label class='rcomponent-content-icon'></label><span class='rcomponent-name' title='condition'>判断</span></div>",
  style: 'shape=rhombus;perimeter=ellipsePerimeter;resizable=0',
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
  style: 'shape=ellipse;label;whiteSpace=wrap;html=1;;resizable=0;align=center',
  width: 80,
  height: 55,
};
