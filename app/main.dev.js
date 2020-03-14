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
import { app, BrowserWindow, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';

const net = require('net');
const appexpress = require('express')();
const bodyParser = require('body-parser'); //解析,用req.body获取post参数
appexpress.use(bodyParser.json());
appexpress.use(bodyParser.urlencoded({ extended: false }));

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow = null;
let loginWindow = null;

let isNetStart = false;
let targetId = undefined;

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
    //useContentSize: true,
    frame: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      devTools: true,
    },
  });

  loginWindow.setMenu(null);

  loginWindow.loadURL(`file://${__dirname}/login.html`);

  loginWindow.on('ready-to-show', function() {
    loginWindow.show();
  });
};

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    show: false,
    width: 1350,
    height: 728,
    minWidth: 1144,
    frame: false,
    // movable: false, //可否移动
    webPreferences: {
      nodeIntegration: true,
      devTools: true,
    },
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);

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
  // if (
  //   process.env.NODE_ENV === 'development' ||
  //   process.env.DEBUG_PROD === 'true'
  // ) {
  //   // await installExtensions();
  // }

  global.sharedObject = {
    token: undefined,
    userName: '',
  };

  // 登录成功切换到主页面
  ipcMain.on('loginSuccess', () => {
    // loginWindow.hide();
    loginWindow.destroy();
    createMainWindow();
    // mainWindow.show();
    // mainWindow.focus();
  });

  // 退出登录切换到登录页面
  ipcMain.on('signOut', () => {
    mainWindow.destroy();
    createLoginWindow();
  });

  // 创建登录窗口

  ipcMain.on('min', e => mainWindow.minimize());
  ipcMain.on('max', e => mainWindow.maximize());
  ipcMain.on('close', e => mainWindow.close());
  ipcMain.on('unmaximize', e => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();

  // 本地监听8888端口 获取动态的xpath元素回填

  // --------------------------- express版本
  appexpress.post('/upload', function(req, res) {
    try {
      // const result = JSON.stringify(req.body);
      // const str = result.replace(/}}/, '}');
      // const finallyResult = str ? JSON.parse(str) : {};
      const finallyResult = req.body;
      mainWindow.restore();
      //将结果通知给渲染进程
      if (targetId === undefined) return;
      mainWindow.webContents.send('updateXpath', {
        ...finallyResult.value,
        targetId,
      });
      targetId = undefined;
    } catch (e) {
      // 处理错误
      console.log('err---', e);
      res.sendStatus(200);
    }

    res.sendStatus(200);
  });

  ipcMain.on('start_server', (event, id) => {
    targetId = id;
    console.log('再次触发选取操作', id);
    if (isNetStart) return;

    appexpress.listen(8888, function() {
      console.log('服务器已启动');
    });
    isNetStart = true;
  });
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', createWindow);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});
