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

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow = null;

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

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    // await installExtensions();
  }

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

  const server = net.createServer();

  // //一些事件
  server.on('listening', function() {
    //的那个服务绑定后触发
    console.log('服务器已启动');
  });

  server.on('connection', function(socket) {
    //当一个新的连接建立时触发，可接收一个socket对象
    console.log('有新的连接！');

    socket.on('data', function(data) {
      const str = data
        .toString()
        .replace(/([\s\S]*)(?={)/, '')
        .replace(/}}/, '}');
      const result = str ? JSON.parse(str) : {};
      mainWindow.restore();
      //将结果通知给渲染进程
      mainWindow.webContents.send('updateXpath', result);
      server.close();
    });
  });

  server.on('close', function() {
    //关闭连接时触发
    console.log('连接已关闭');
  });

  ipcMain.on('start_server', () => {
    console.log('hhhhhhhhhhhhh');
    server.listen('8888', '127.0.0.1'); //监听已有的连接
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
