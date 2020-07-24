import { Action_DeleteCell } from "../actions/deleteCell";
import { Action_CopyCell, Action_PasteCell } from "../actions/copyCell";

export default (
  graph,
  menu,
  cell,
  evt,
  mxClipboard,
  changeSavingModuleData,
  graphDataMapRef,
  setGraphDataMap
) => {
  if (cell != null) {
    const clickMenuCopy = () => {
      Action_CopyCell(graph, { mxClipboard });
    };
    const clickMenuDelet = () => {
      Action_DeleteCell(graph);
    };
    const clickMenuAddToReuse = () => {};
    const clickMenuExport = () => {};
    const clickMenuExecuteBefore = () => {};
    const clickMenuExecuteAfter = () => {};

    const menuItems = [
      {
        name: "复制",
        handle: clickMenuCopy,
      },
      {
        name: "删除",
        handle: clickMenuDelet,
      },
      {
        name: "添加到复用",
        handle: clickMenuAddToReuse,
      },
      {
        name: "导出到本地",
        handle: clickMenuExport,
      },
      {
        name: "执行到此处",
        handle: clickMenuExecuteBefore,
      },
      {
        name: "从此处执行",
        handle: clickMenuExecuteAfter,
      },
    ];

    menuItems.forEach((item) => menu.addItem(item.name, "", item.handle));
  } else {
    const clickMenuUndo = () => {};
    const clickMenuRedo = () => {};
    const clickMenuPasteHere = () => {
      Action_PasteCell(graph, { mxClipboard });
    };

    const menuItems = [
      {
        name: "取消",
        handle: clickMenuUndo,
      },
      {
        name: "重做",
        handle: clickMenuRedo,
      },
      {
        name: "粘贴到此处",
        handle: clickMenuPasteHere,
      },
    ];
    menuItems.forEach((item) => menu.addItem(item.name, "", item.handle));
  }
};
