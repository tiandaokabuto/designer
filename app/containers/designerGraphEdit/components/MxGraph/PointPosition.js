// 出口点
export const POINT_POSITION_EXIT = {
  TOP: 'exitX=0.5;exitY=0;', // 上点， 对应ggeditor的点位置是0
  BOTTOM: 'exitX=0.5;exitY=1;', // 下点， 对应ggeditor的点位置是1
  LEFT: 'exitX=0;exitY=0.5;', // 左点， 对应ggeditor的点位置是2
  RIGHT: 'exitX=1;exitY=0.5;', // 右点， 对应ggeditor的点位置是3
  NORMAL: 'exitDx=0;exitDy=0;',
};

// 入口点
export const POINT_POSITION_ENTRY = {
  TOP: 'entryX=0.5;entryY=0;', // 上点， 对应ggeditor的点位置是0
  BOTTOM: 'entryX=0.5;entryY=1;', // 下点， 对应ggeditor的点位置是1
  LEFT: 'entryX=0;entryY=0.5;', // 左点， 对应ggeditor的点位置是2
  RIGHT: 'entryX=1;entryY=0.5;', // 右点， 对应ggeditor的点位置是3
  NORMAL: 'entryDx=0;entryDy=0;',
};
