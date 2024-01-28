const { app, BrowserWindow, ipcMain, screen, dialog, nativeTheme } = require('electron');

let isDarkMode = nativeTheme.shouldUseDarkColors;

const path = require('path');
const { default: mainIpcs } = require('./main/utils/mainProcess');
const { IS_DEV_MODE } = require('./config/constants');
let mainWin = null;
let miniWin = null;
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}
let isSingleInstance = app.requestSingleInstanceLock();
// app.commandLine.appendSwitch('high-dpi-support', 1);
// app.commandLine.appendSwitch('force-device-scale-factor', 1);
if (!isSingleInstance) {
  app.quit();
}

app.on('second-instance', (event, commandLine, workingDirectory) => {
  if (process.platform !== 'darwin') {
    // Extract the parameter from the command-line arguments.
    const args = commandLine.slice(1);
    if (args.length > 1) {
      const params = args[1];

      // Handle the new parameter received from the second instance
      // Here, you can pass the new parameter to your "mini player" window or any other logic you need.
      if (miniWin) {
        // dialog.showMessageBoxSync({
        //   title: 'GOT!',
        //   message: params,
        //   buttons: ['OK'],
        // });
        miniWin.webContents.send('play-mini', params);
      } else {
        // createMiniPlayerWindow(params);
      }
    }
  }
});

// dialog.showMessageBox({
//   title :"TEST",
//   message: 'Hi',
//   buttons: ['OK']
// })
// console.log(global.sharedObject);

const createWindow = () => {
  // Create the browser mainWindowdow.
  let params;
  if (!IS_DEV_MODE) {
    params = `C:\\Users\\ITESaurabh\\Music\\ele.mp3`;

    // setTimeout(() => {
    //   params = 'C:\\Users\\Saura\\Downloads\\Music\\Chand Sifarish - Fanaa 320 Kbps.mp3';
    // }, 10000);

    // params = process.argv[1];
  } else {
    params = process.argv[1];
    // console.log("PARAMS",params);

    try {
      // dialog.showMessageBoxSync({
      //   title: 'play-mini',
      //   message: params,
      //   buttons: ['OK'],
      // });
      // mainWin.
      miniWin.webContents.send('play-mini', params);
    } catch (err) {
      // dialog.showMessageBox({
      //   title: 'ERROR',
      //   message: JSON.stringify(err),
      //   buttons: ['OK'],
      // });
    }
  }
  // console.log(params);
  // eslint-disable-next-line no-useless-escape
  // const params = `C:\Users\Saura\Downloads\Music\Atif Aslam &Shreya Ghoshal - Jeene Laga Hoon.mp3`;
  if (params && params !== '.') {
    // dialog.showErrorBox('ARGS', `${typeof params}`);

    if (!miniWin || miniWin.isDestroyed()) {
      let loading = new BrowserWindow({
        show: false,
        frame: false,
        width: 400,
        height: 250,
        backgroundColor: '#050407',
        darkTheme: true,
        resizable: false,
        webPreferences: {
          webSecurity: process.env.NODE_ENV !== 'development',
          enableRemoteModule: true,
        },

        // icon: './assets/logo/XeroTunesLogo.png',
      });
      // console.log("DOIR", __dirname);
      loading.loadFile(path.join(__dirname, 'loader.html'));

      loading.once('ready-to-show', () => {
        loading.show();
      });

      loading.once('show', () => {
        miniWin = new BrowserWindow({
          width: 400,
          height: 250,
          show: false,
          resizable: false,
          // backgroundColor: '#2e2c29',
          // transparent: true,
          // icon: '',
          opacity: 0.98,
          // thickFrame: false,
          darkTheme: true,
          minimizable: false,
          alwaysOnTop: false,
          frame: false, // NEED TO CHECK ON WIN /MAC ::DONE::
          titleBarStyle: 'hidden',
          webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false,
            enableRemoteModule: false,
          },
        });
        miniWin.webContents.once('dom-ready', () => {
          miniWin.show();
          miniWin.webContents.send('play-mini', params);
          loading.hide();
          loading.close();
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
          // console.log('val', message);
          miniWin.webContents.send('play-mini', message);
        });
        // eslint-disable-next-line no-undef
        miniWin.loadURL(MINI_PLAYER_WEBPACK_ENTRY);
      });
    } else {
      // If the "mini player" window is already open, update its contents with the new parameter.
      // dialog.showMessageBox({
      //   title: 'MAIN FOUND',
      //   message: params,
      //   buttons: ['OK'],
      // });
      miniWin.show();
      miniWin.webContents.send('play-mini', params);
    }
  } else {
    // dialog.showErrorBox('ARGS here', `${typeof params}`);
    let loading = new BrowserWindow({
      show: false,
      frame: false,
      width: 400,
      height: 250,
      backgroundColor: '#050407',
      darkTheme: true,
      resizable: false,
      webPreferences: {
        webSecurity: process.env.NODE_ENV !== 'development',
        enableRemoteModule: true,
      },
      // icon: './assets/logo/XeroTunesLogo.png',
    });
    // console.log("DOIR", __dirname);
    loading.loadFile(path.join(__dirname, 'loader.html'));

    loading.once('ready-to-show', () => {
      loading.show();
    });

    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;

    loading.once('show', () => {
      mainWin = new BrowserWindow({
        minWidth: 400,
        minHeight: 400,
        width: width - 500,
        height: height - 200,
        show: false,
        // backgroundColor: '#2e2c29',
        // opacity:0.2,
        darkTheme: true,
        // titleBarStyle:'hidden',
        trafficLightPosition: {
          x: 10,
          y: 13,
        },
        frame: false, // NEED TO CHECK ON WIN /MAC ::DONE::
        titleBarStyle: 'hidden',
        titleBarOverlay: {
          color: isDarkMode ? '#201e23' : '#f4f1f9',
          symbolColor: isDarkMode ? '#ffffff' : '#050407',
          height: 32,
        },
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
          webSecurity: process.env.NODE_ENV !== 'development',
          enableRemoteModule: true,
        },
      });
      mainWin.webContents.once('dom-ready', () => {
        console.log('mainWin loaded');
        console.log(process.env.NODE_ENV);
        mainWin.show();
        loading.hide();
        loading.close();
      });
      // relocating all IPC Events to mainProcess file to declutter this file
      mainIpcs(mainWin);
      // long loading html
      // eslint-disable-next-line no-undef
      mainWin.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
    });
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
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
