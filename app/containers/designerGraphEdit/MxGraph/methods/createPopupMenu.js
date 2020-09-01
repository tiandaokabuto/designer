import { Action_DeleteCell } from '../actions/deleteCell';
import { Action_CopyCell, Action_PasteCell } from '../actions/copyCell';
import event, { START_POINT } from '@/containers/eventCenter';
import { addToReuse, exportCustomProcessBlock } from '_utils/utils';

import store from '@/store';
import {
  DEBUG_START_TO_HERE,
  DEBUG_HERE_TO_END,
} from '../../../../constants/actions/debugInfos';

export default (
  graph,
  menu,
  cell,
  evt,
  mxClipboard,
  changeSavingModuleData,
  graphDataMapRef,
  setGraphDataMap,
  deleteGraphDataMap,
  changeCheckedGraphBlockId,
  graphData,
  undoAndRedoRef
) => {
  if (cell != null) {
    const clickMenuCopy = () => {
      Action_CopyCell(graph, { mxClipboard, changeSavingModuleData });
    };
    const clickMenuDelet = () => {
      Action_DeleteCell(graph, {
        deleteGraphDataMap,
        changeCheckedGraphBlockId,
        graphData,
      });
    };
    const clickMenuAddToReuse = () => {
      addToReuse();
    };
    const clickMenuExport = () => {
      exportCustomProcessBlock();
    };
    const clickMenuExecuteBefore = () => {
      const { debug } = store.getState();
      if (debug.switch) {
        event.emit(DEBUG_START_TO_HERE);
      } else {
        event.emit(START_POINT, 'to');
      }
    };
    const clickMenuExecuteAfter = () => {
      const { debug } = store.getState();
      if (debug.switch) {
        event.emit(DEBUG_HERE_TO_END);
      } else {
        event.emit(START_POINT, 'from');
      }
    };

    const menuItems = [
      {
        name: '复制',
        handle: clickMenuCopy,
      },
      {
        name: '删除',
        handle: clickMenuDelet,
      },
      {
        name: '添加到复用',
        handle: clickMenuAddToReuse,
      },
      {
        name: '导出到本地',
        handle: clickMenuExport,
      },
      {
        name: '执行到此处',
        handle: clickMenuExecuteBefore,
      },
      {
        name: '从此处执行',
        handle: clickMenuExecuteAfter,
      },
    ];

    menuItems.forEach(item => menu.addItem(item.name, '', item.handle));
  } else {
    const clickMenuUndo = () => {};
    const clickMenuRedo = () => {};
    const clickMenuPasteHere = () => {
      Action_PasteCell(graph, {
        mxClipboard,
        setGraphDataMap,
        changeCheckedGraphBlockId,
        graphData,
        undoAndRedoRef,
      });
    };

    const menuItems = [
      {
        name: '取消',
        handle: clickMenuUndo,
      },
      // {
      //   name: '重做',
      //   handle: clickMenuRedo,
      // },
      {
        name: '粘贴到此处',
        handle: clickMenuPasteHere,
      },
    ];
    menuItems.forEach(item => menu.addItem(item.name, '', item.handle));
  }
};
