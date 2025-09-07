/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { getAssetPath, resolveHtmlPath } from './util';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null; // 主窗口
let syncWindow: BrowserWindow | null = null; // 拉取窗口

//#region IPC命令处理
ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

// TODO 改成一个Channel用不同参数
ipcMain.on('close-main', () => {
  // 隐藏主窗口
  if (mainWindow) {
    //TODO 改成hide
    mainWindow.hide();
  }
  createSyncWindow();
});
//#endregion

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

//#region 打开开发者工具
const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug').default();
}
//#endregion

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createMainWindow = async () => {
  // if (isDebug) {
  //   await installExtensions();
  // }
  
  if(mainWindow) {
    mainWindow.show();
    return;
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 800,
    height: 600,
    // resizable: false, // 不允许调节大小
    icon: getAssetPath(['icon.png']),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  // 加载renderer/index.html页面
  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  // new AppUpdater();
};

const createSyncWindow = async () => {
    if (syncWindow) {
        syncWindow.show();
        return;
    }

    syncWindow = new BrowserWindow({
        show: false,
        width: 800,
        height: 600,
        // parent: mainWindow!, // 设置为父窗口
        // modal: true, // 设置为模态窗口（可选）
        icon: getAssetPath(['icon.png']),
        webPreferences: {
          preload: app.isPackaged
            ? path.join(__dirname, 'preload.js')
            : path.join(__dirname, '../../.erb/dll/preload.js'),
        },
    });

    syncWindow.loadURL(resolveHtmlPath('sync.html'));

    syncWindow.on('ready-to-show', () => {
      if (!syncWindow) {
        throw new Error('"syncWindow" is not defined');
      }
      syncWindow.show();
    });
    
    syncWindow.on('closed', () => {
        syncWindow = null;
        // 显示主窗口
        if(mainWindow) {
          mainWindow.show();
        }
    });

    syncWindow.webContents.setWindowOpenHandler((edata) => {
      shell.openExternal(edata.url);
      return { action: 'deny' };
    });
}

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createMainWindow();
    app.on('activate', () => {
      if (mainWindow === null) createMainWindow();
    });
  })
  .catch(console.log);
