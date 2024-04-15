import { BrowserWindow, dialog, ipcMain, nativeTheme, shell } from 'electron';
import { parseDir, parseMusic } from '../modules/FileParser';
import { APP_CONF_FOLDER } from '../../config/core_config';

function sendMessageToRendererProcess(window, message, payload) {
  window.webContents.send(message, payload);
}
export default function mainIpcs(mainWin) {
  // mainWin.webContents.send('asynchronous-message', {'SAVED': 'File Saved'});
  // mainWin.webContents.openDevTools();
  mainWin.on('minimize', () => {
    mainWin.setOpacity(1);
    setTimeout(() => {
      mainWin.setOpacity(0);
    }, 2000 / 60);
  });

  mainWin.on('restore', async () => {
    mainWin.setOpacity(0);
    setTimeout(() => {
      mainWin.setOpacity(1);
    }, 6000 / 60);
  });

  ipcMain.on('minimize', () => mainWin.minimize());
  ipcMain.on('maximize', () => {
    if (mainWin.isMaximized()) {
      mainWin.unmaximize();
      mainWin.center();
    } else {
      mainWin.maximize();
    }
  });
  mainWin.on('resize', () => {
    if (!mainWin.isMinimized()) {
      const win = BrowserWindow.getFocusedWindow();
      if (win) {
        const isMax = win.isMaximized();
        return sendMessageToRendererProcess(mainWin, 'expand-state', isMax);
      }
    }
  });
  ipcMain.on('closeWindow', () => {
    mainWin.close();
  });
  ipcMain.handle('get-dark-mode', () => {
    return nativeTheme.shouldUseDarkColors;
  });
  ipcMain.on('show-dialog', (e, payload) => {
    const { title } = payload;
    dialog.showMessageBox({
      title: title,
      buttons: ['Dismiss'],
      type: 'warning',
      message: 'Application is not responding…',
    });
  });

  ipcMain.on('open-dir', (e, payload) => {
    const tester = require('../modules/tester');
    tester.start();
    shell.openPath(APP_CONF_FOLDER);
  });
  ipcMain.on('open-db', (e, payload) => {
    const db = require('../../database');

    db.exec(`CREATE TABLE IF NOT EXISTS audio_files (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         tag_type,
         path,
         file_name,
         file_ext,
         file_size,
         folder_name,
         file_path,
         title TEXT,
         artist,
         album,
         track,
         genre,
         year,
         album_art
       )`);
    // db.exec('CREATE TABLE IF NOT EXISTS audio_files (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)');
    // const stmt = db.prepare('INSERT INTO users (name) VALUES (?)');
    // const insertResult = stmt.run('John Doe', '2');

    // if (insertResult.changes > 0) {
    //    console.log('User added successfully');
    // } else {
    //    console.error('Failed to add user');
    // }

    // const users = db.prepare('SELECT * FROM users').all();
    // console.log(users);
  });

  ipcMain.on('process-files', (e, payload) => {
    console.log(payload);
    const SongsPathList = parseDir(payload);
    SongsPathList.forEach(async songPath => {
      const SongInfo = await parseMusic(songPath);
      console.info('Info', SongInfo);
    });
  });
  ipcMain.on('my-message', (e, payload) => {
    console.log('YO');
    sendMessageToRendererProcess(mainWin, 'my-reply', 'data');
  });

  // // Handle IPC message to play a sound
  // ipcMain.on('playSound', (event, soundData) => {
  //   mainWin.webContents.send('playSound', soundData);
  // });

  // // Handle IPC message to receive sound metadata
  // ipcMain.on('soundMetadata', (event, { timeInterval, tags }) => {
  //   // Do something with the time interval and tags
  //   console.log('Time Interval:', timeInterval);
  //   console.log('Tags:', tags);
  // });

  // async function parseFolder(folderPath, foldersFinalData) {
  //    return new Promise()(resolve => {
  //       (function recursiveReader(folderPath) {
  //          const SongsPathList = parseDir(payload);
  //          SongsPathList.forEach(async songPath => {
  //             const SongInfo = await parseMusic(songPath);
  //             console.info('Info', SongInfo);
  //          });
  //       });

  //          resolve(foldersFinalData);
  //       })(folderPath, foldersFinalData);
  //    });
  // }

  ipcMain.once('show-file-picker', async e => {
    let myTracks = [];
    await dialog
      .showOpenDialog(mainWin, {
        title: 'Select Music Folder',
        properties: ['openDirectory'],
      })
      .then(result => {
        if (!result.canceled) {
          const folderPath = result.filePaths[0];

          pool
            .exec('fibonacci', [10])
            .then(function (result) {
              console.log('Result: ' + result); // outputs 55
            })
            .catch(function (err) {
              console.error(err);
            })
            .then(function () {
              pool.terminate(); // terminate all workers when done
            });
        }
        // if (result.canceled) {
        //   console.log('Dialog was canceled');
        // } else {
        //   const folder = result.filePaths[0];
        //   console.log(folder);

        //   try {
        //     const worker = new Worker('musicParserWorker.js');

        //     worker.onmessage = function (event) {
        //       console.log(event.data);
        //     };
        //     worker.postMessage(folder);

        //     // const SongsPathList = parseDir(folder);
        //     // SongsPathList.forEach(songPath => {
        //     //   const SongInfo = parseMusic(songPath);
        //     //   SongInfo.then(song => {
        //     //     console.info('Info', song);
        //     //   });
        //     // });
        //     // const checFun = async () => {};
        //     // await checFun();
        //     // const folderCont = fs
        //     //    .readdirSync(folder)
        //     //    .map(content => path.join(folder, content))
        //     //    .map(content => path.parse(content))
        //     //    .map(pathObject => {
        //     //       const po = { name: pathObject.name, extension: pathObject.ext };
        //     //       return po;
        //     //    });
        //     // const subFolders = folderCont
        //     //    .filter(content => content.extension == '')
        //     //    .map(subFolder => path.join(folder, subFolder.name));
        //     // file;
        //     // console.log(myList);
        //     // console.log(subFolders);
        //     // previewWin.loadURL(`file://${file}`);
        //   } catch (e) {
        //     console.log(e);
        //   }
        // }
      })
      .catch(err => {
        console.log(err);
      });
  });
}
