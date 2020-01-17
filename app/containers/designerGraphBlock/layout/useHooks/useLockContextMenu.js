/* eslint-disable */

let isLocked = false;

/**
 * 右键菜单加锁
 * @param {*} locked
 */
const useLockContextMenu = locked => {
  const contextMenu = document.querySelector('.react-contextmenu');
  if (contextMenu) {
    if (locked) {
      contextMenu.style.visibility = 'hidden';
      isLocked = true;
    }

    document.oncontextmenu = function() {
      if (!isLocked) return;
      contextMenu.style.visibility = '';
      isLocked = false;
    };
  }
};
export default useLockContextMenu;
