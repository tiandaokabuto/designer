/* eslint global-require: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
// import { app, BrowserWindow, ipcMain, dialog } from 'electron';
// import { autoUpdater } from 'electron-updater';
// import log from 'electron-log';
// import MenuBuilder from './menu';

const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  globalShortcut,
} = require('electron');
const log = require('electron-log');
const MenuBuilder = require('./menu');

const path = require('path');
const net = require('net');
const appexpress = require('express')();
const bodyParser = require('body-parser');
// 解析,用req.body获取post参数
appexpress.use(bodyParser.json({ limit: '5mb' }));
appexpress.use(bodyParser.urlencoded({ extended: false }));

// 本地监听8888端口 获取动态的xpath元素回填

// --------------------------- express版本
appexpress.post('/query', function (req, res) {
  if (targetId === undefined) {
    res.sendStatus(500);
  } else {
    res.sendStatus(200);
  }
});
appexpress.post('/upload', function (req, res) {
  try {
    const finallyResult = req.body;

    // 将结果通知给渲染进程
    if (targetId === undefined) {
      res.sendStatus(500);
      return;
    }

    if (!finallyResult.value) {
      return;
    }
    // console.log(finallyResult.value);
    mainWindow.restore();
    mainWindow.webContents.send('updateXpath', {
      ...finallyResult.value,
      targetId,
    });
    targetId = undefined;
  } catch (e) {
    // 处理错误
    res.sendStatus(200);
  }

  res.sendStatus(200);
});

// let count = 0;
appexpress.post('/xpathStatus', function (rea, res) {
  // count++;
  // console.log(
  //   '/xpathStatus' + count + '_____' + global.sharedObject.xpathStatus
  // );
  if (global.sharedObject.xpathStatus) {
    res.status(200).send('is_done');
    global.sharedObject.xpathStatus = false;
  } else {
    res.status(200).send('not_ok');
  }
});

appexpress.post('/position', function (req, res) {
  try {
    const finallyResult = req.body;

    // 将结果通知给渲染进程
    if (targetId === undefined) {
      res.sendStatus(500);
      return;
    }

    if (!finallyResult.value) {
      return;
    }
    // console.log(finallyResult.value);

    mainWindow.restore();
    mainWindow.webContents.send('updateMousePosition', {
      ...finallyResult.value,
      targetId,
    });
    targetId = undefined;
  } catch (e) {
    // 处理错误
    res.sendStatus(200);
  }

  res.sendStatus(200);
});

appexpress.post('/windowArray', function (req, res) {
  console.log('windowArray');
  try {
    const finallyResult = req.body;

    // 将结果通知给渲染进程
    if (targetId === undefined) {
      res.sendStatus(500);
      return;
    }

    if (!finallyResult.value) {
      return;
    }
    // console.log(finallyResult.value);
    mainWindow.restore();
    mainWindow.webContents.send('getWindowArray', {
      resultArr: finallyResult.value,
      targetId,
    });
    targetId = undefined;
  } catch (e) {
    console.log(e);
    // 处理错误
    res.sendStatus(200);
  }

  res.sendStatus(200);
});

appexpress.post('/clickImage', function (req, res) {
  try {
    const finallyResult = req.body;

    // 将结果通知给渲染进程
    if (targetId === undefined) {
      res.sendStatus(500);
      return;
    }

    if (!finallyResult.value) {
      return;
    }
    console.log(finallyResult.value);

    mainWindow.restore();
    mainWindow.webContents.send('updateClickImage', {
      ...finallyResult.value,
      targetId,
    });
    targetId = undefined;
  } catch (e) {
    // 处理错误
    res.sendStatus(200);
  }

  res.sendStatus(200);
});

module.exports = exports = class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
};

let mainWindow = null;
let loginWindow = null;

let isNetStart = false;
let targetId;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

const createLoginWindow = () => {
  loginWindow = new BrowserWindow({
    show: false,
    width: 800,
    height: 500,
    // useContentSize: true,
    frame: false,
    hasShadow: true,
    resizable: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      devTools: true,
    },
  });

  loginWindow.setIcon(path.join(__dirname, 'small.png'));

  loginWindow.setMenu(null);

  loginWindow.loadURL(`file://${__dirname}/login.html`);

  // loginWindow.webContents.openDevTools();
  loginWindow.on('ready-to-show', function () {
    loginWindow.show();
  });
};

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    show: false,
    width: 1350,
    height: 728,
    frame: false,
    transparent: true,
    minWidth: 1144,
    hasShadow: true,
    // movable: false, //可否移动
    webPreferences: {
      nodeIntegration: true,
      devTools: true,
    },
  });

  mainWindow.setIcon(path.join(__dirname, 'small.png'));

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  // globalShortcut.register('f11', (event, arg) => {
  //   if (loginWindow) {
  //     loginWindow.webContents.openDevTools();
  //   } else if (mainWindow) {
  //     mainWindow.webContents.openDevTools();
  //   }
  // });

  // mainWindow.webContents.openDevTools();
  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }

    mainWindow.webContents.send('updateIpAndPort');

    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

const createWindow = async () => {
  createLoginWindow();
  // createMainWindow();
  // if (
  //   process.env.NODE_ENV === 'development' ||
  //   process.env.DEBUG_PROD === 'true'
  // ) {
  //   // await installExtensions();
  // }

  global.sharedObject = {
    token: undefined,
    userName: '',
    xpathStatus: false,
  };

  // 登录成功切换到主页面
  ipcMain.on('loginSuccess', () => {
    // loginWindow.hide();
    createMainWindow();
    loginWindow && loginWindow.destroy();
    // mainWindow.show();
    // mainWindow.focus();
  });

  // 退出登录切换到登录页面
  ipcMain.on('signOut', () => {
    createLoginWindow();
    // mainWindow.hide();
    // loginWindow.show();
    // loginWindow.focus();
    mainWindow && mainWindow.destroy();
  });

  // 选择文件存储路径
  ipcMain.on('open-directory-dialog', function (
    event,
    func,
    label = '存储',
    defaultName,
    title = '流程另存为',
    properties = []
  ) {
    dialog[func](mainWindow, {
      title,
      buttonLabel: label,
      properties,
      defaultPath: defaultName,
    })
      .then(({ filePath, filePaths, canceled }) => {
        if (!canceled) {
          event.sender.send('selectedItem', filePath || filePaths);
        }
        return filePath || filePaths;
      })
      .catch(err => console.log(err));
  });

  ipcMain.on('choose-directory-dialog', function (
    event,
    func,
    label = '存储',
    properties = [],
    filters = [{ name: 'All Files', extensions: ['zip'] }]
  ) {
    dialog[func](mainWindow, {
      buttonLabel: label,
      filters,
      properties,
    })
      .then(({ filePaths, canceled }) => {
        if (!canceled) {
          event.sender.send('chooseItem', filePaths);
        }
      })
      .catch(err => {
        console.log(err);
      });
  });

  // 创建登录窗口

  ipcMain.on('min', e => mainWindow.minimize());
  ipcMain.on('max', e => mainWindow.maximize());
  ipcMain.on('close', () => {
    app.quit();
  });
  ipcMain.on('unmaximize', e => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  ipcMain.on('start_server', (event, id) => {
    targetId = id;
    if (isNetStart) return;

    appexpress.listen(8888, function () {
      console.log('服务器已启动');
    });
    isNetStart = true;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  // new AppUpdater();
};

/**
 * Add event listeners...
 */

// 忽略与证书相关的错误.
app.commandLine.appendSwitch('--ignore-certificate-errors', 'true');

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    globalShortcut.unregisterAll();
    app.quit();
  }
});

app.on('ready', createWindow);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});
