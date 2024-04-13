const { app, BrowserWindow, ipcMain, screen, nativeTheme, Menu } = require('electron');

let isDarkMode = nativeTheme.shouldUseDarkColors;

const fs = require('fs');
const path = require('path');
const { default: mainIpcs } = require('./main/utils/mainProcess');
let mainWin = null;
let miniWin = null;
let loadingWin = null;
Menu.setApplicationMenu(null);

const parsedArgs = require('minimist')(process.argv.slice(1), {
  boolean: ['help', 'version'],
  string: ['file'],
  alias: { help: 'h', version: 'v', file: 'f' },
});

if (require('electron-squirrel-startup')) {
  app.quit();
}
let isSingleInstance = app.requestSingleInstanceLock();
// app.commandLine.appendSwitch('high-dpi-support', 1);
// app.commandLine.appendSwitch('force-device-scale-factor', 1);
if (!isSingleInstance) {
  app.quit();
}

app.on('second-instance', (event, commandLine) => {
  if (process.platform !== 'darwin') {
    // Extract the parameter from the command-line arguments.
    const args = commandLine.slice(1);
    if (args.length > 1) {
      const params = args[1];

      // Handle the new parameter received from the second instance
      if (miniWin) {
        miniWin.webContents.send('play-mini', params);
      }
    }
  }
});

const createWindow = () => {
  loadingWin = new BrowserWindow({
    show: false,
    frame: false,
    titleBarStyle: 'hidden',
    width: 400,
    height: 250,
    // opacity: 0.98,
    backgroundColor: '#050407',
    backgroundMaterial: 'auto',
    darkTheme: true,
    minimizable: false,
    maximizable: false,
    resizable: false,
    icon: './assets/logo/XeroTunesLogo.png',
  });

  loadingWin.loadFile(path.join(__dirname, 'loader.html'));

  loadingWin.once('ready-to-show', () => {
    loadingWin.show();
  });

  const firstArg = parsedArgs._[0];
  if (firstArg && firstArg !== '.' && fs.existsSync(path.resolve(firstArg))) {
    parsedArgs['file'] = firstArg;
  }

  if (parsedArgs['file']) {
    if (!miniWin || miniWin.isDestroyed()) {
      loadingWin.once('show', () => {
        miniWin = new BrowserWindow({
          width: 400,
          height: 250,
          show: false,
          resizable: false,
          backgroundColor: '#2e2c29',
          opacity: 0.98,
          // thickFrame: false,
          darkTheme: true,
          minimizable: false,
          maximizable: false,
          alwaysOnTop: false,
          frame: false, // NEED TO CHECK ON WIN /MAC ::DONE::
          titleBarStyle: 'hidden',
          webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: process.env.NODE_ENV !== 'development',
          },
        });
        miniWin.webContents.once('dom-ready', () => {
          miniWin.show();
          // miniWin.webContents.openDevTools();
          miniWin.webContents.send('play-mini', path.resolve(parsedArgs['file']));
          loadingWin.hide();
          loadingWin.close();
        });
        ipcMain.on('minimize', () => miniWin.minimize());
        ipcMain.on('maximize', () => {
          if (miniWin.isMaximized()) {
            miniWin.unmaximize();
            miniWin.center();
          } else {
            miniWin.maximize();
          }
        });
        ipcMain.on('closeWindow', () => {
          miniWin.close();
        });
        ipcMain.on('add-track', (e, message) => {
          miniWin.webContents.send('play-mini', message);
        });
        // eslint-disable-next-line no-undef
        miniWin.loadURL(MINI_PLAYER_WEBPACK_ENTRY);
      });
    } else {
      // If the "mini player" window is already open, update its contents with the new parameter.
      miniWin.show();
      miniWin.webContents.send('play-mini', path.resolve(parsedArgs['file']));
      // miniWin.webContents.openDevTools();
    }
    return;
  }

  // console.log(parsedArgs, process.argv);

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  loadingWin.once('show', () => {
    mainWin = new BrowserWindow({
      minWidth: 450,
      minHeight: 400,
      width: width - 200,
      height: height - 100,
      show: false,
      backgroundColor: '#201e23',
      backgroundMaterial: 'auto',
      opacity: 1,
      darkTheme: isDarkMode ? true : false,
      trafficLightPosition: {
        x: 10,
        y: 13,
      },
      frame: false, // NEED TO CHECK ON WIN /MAC ::DONE::
      titleBarStyle: 'hidden',
      // titleBarOverlay: {
      //   color: isDarkMode ? '#201e23' : '#f4f1f9',
      //   symbolColor: isDarkMode ? '#ffffff' : '#050407',
      //   height: 32,
      // },
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        webSecurity: process.env.NODE_ENV !== 'development',
        scrollBounce: true,
        // backgroundThrottling: false
        // enableRemoteModule: true,
      },
    });
    mainWin.setMenu(null);
    mainWin.once('ready-to-show', () => {
      mainWin.show();
      loadingWin.hide();
      loadingWin.close();
    });

    // relocating all IPC Events to mainProcess file to declutter this file
    mainIpcs(mainWin);
    // eslint-disable-next-line no-undef
    mainWin.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  });
};
// Example usage: Call the function when you want to update the parameters in the existing window
// This method will be called when Electron has finished
// initialization and is ready to create browser mainWindowdows.
// Some APIs can only be used after this event occurs.

app.on('ready', createWindow);

// Quit when all mainWindowdows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darmainWindow') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
