import { BrowserWindow, dialog, ipcMain, nativeTheme, shell } from 'electron';
import { parseDir, parseMusic } from '../modules/FileParser';
const db = require('../../database');
const path = require('path');
const fs = require('fs');
const { fork } = require('child_process');
const { APP_CONF_FOLDER, MUSIC_DIR, ALBUM_ART_DIR, ARTIST_ART_DIR } = require('../../config/core_config');

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

  ipcMain.handle('scan-media', async e => {
    // Get all music folders
    const folders = db.prepare('SELECT * FROM MusicFolder').all();
    if (!folders.length) return { success: false, error: 'No folders to scan' };

    // Prepare config
    const config = {
      APP_CONF_FOLDER,
      MUSIC_DIR,
      ALBUM_ART_DIR,
      ARTIST_ART_DIR
    };

    // Spawn a worker process for scanning
    const worker = fork(path.resolve(process.cwd(), 'src', 'main', 'utils', 'musicScanWorker.js'));
    worker.send({ folders, config });

    return new Promise((resolve, reject) => {
      worker.on('message', msg => {
        if (msg.success) {
          console.log(`Scanned ${msg.scanned} files successfully.`);
          
          resolve({ success: true, scanned: msg.scanned });
        } else {
          reject(msg.error);
        }
      });
      worker.on('error', err => reject(err));
      worker.on('exit', code => {
        if (code !== 0) reject('Worker exited with code ' + code);
      });
    });
  });

  mainWin.webContents.on('before-input-event', (event, input) => {
    if ((input.control && input.shift && input.key.toLowerCase() === 'i') || input.key === 'F12') {
      mainWin.webContents.openDevTools();
      event.preventDefault();
    }
  });

  db.prepare(
    `CREATE TABLE IF NOT EXISTS Genre (
         Id INTEGER PRIMARY KEY AUTOINCREMENT,
         Name TEXT,
         Version INTEGER
       )`
  ).run();

  db.prepare(
    `CREATE TABLE IF NOT EXISTS Artist (
         Id INTEGER PRIMARY KEY AUTOINCREMENT,
         Name TEXT,
         ProfileImgUri TEXT,
         Version INTEGER
       )`
  ).run();

  db.prepare(
    `CREATE TABLE IF NOT EXISTS Album (
         Id INTEGER PRIMARY KEY AUTOINCREMENT,
         Title TEXT,
         CoverUri TEXT,
         ArtistId INTEGER,
         GenreId INTEGER,
         ReleaseYear INTEGER,
         Duration INTEGER,
         Editable INTEGER,
         DateAdded BIGINT,
         Version INTEGER
       )`
  ).run();

  db.prepare(
    `CREATE TABLE IF NOT EXISTS MusicFolder (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  Uri TEXT NOT NULL,
  Name TEXT,
  DateModified INTEGER,
  ItemsCount INTEGER,
  Version INTEGER
)`
  ).run();

  db.prepare(`
  CREATE TABLE IF NOT EXISTS Track (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Uri TEXT,
    Extension TEXT,
    Title TEXT,
    ArtistId INTEGER,
    AlbumId INTEGER,
    GenreId INTEGER,
    TrackNumber TEXT,
    Year TEXT,
    AlbumArt TEXT,
    FileHash TEXT,
    Duration INTEGER,
    BitRate INTEGER,
    SampleRate INTEGER,
    Channels INTEGER,
    DiscNumber INTEGER,
    ReleaseYear INTEGER,
    DateAdded BIGINT,
    Version INTEGER
  )
`).run();

  ipcMain.handle('add-music-folder', async e => {
    const result = await dialog.showOpenDialog(mainWin, {
      title: 'Select Music Folder',
      properties: ['openDirectory'],
    });

    if (result.canceled || !result.filePaths[0]) {
      return { success: false, error: 'No folder selected' };
    }

    const folderPath = result.filePaths[0];
    const folderName = path.basename(folderPath);
    const stats = fs.statSync(folderPath);
    const itemsCount = fs.readdirSync(folderPath).length;

    const stmt = db.prepare(
      'INSERT INTO MusicFolder (Uri, Name, DateModified, ItemsCount, Version) VALUES (?, ?, ?, ?, ?)'
    );
    stmt.run(folderPath, folderName, stats.mtimeMs, itemsCount, 1);

    return {
      success: true,
      folder: {
        Uri: folderPath,
        Name: folderName,
        DateModified: stats.mtimeMs,
        ItemsCount: itemsCount,
        Version: 1,
      },
    };
  });

  ipcMain.handle('get-music-folders', () => {
    const rows = db.prepare('SELECT * FROM MusicFolder').all();
    return rows;
  });

  ipcMain.handle('remove-music-folder', (e, { Id }) => {
    const stmt = db.prepare('DELETE FROM MusicFolder WHERE Id = ?');
    stmt.run(Id);
    return { success: true };
  });

  ipcMain.handle('get-all-songs', () => {
    return db.prepare(`
      SELECT
        Track.Id,
        Track.Title,
        Track.Uri,
        Track.Extension,
        Track.Year,
        Track.TrackNumber,
        Track.AlbumArt,
        Track.Duration,
        Artist.Name AS ArtistName,
        Album.Title AS AlbumTitle,
        Genre.Name AS GenreName
      FROM Track
      LEFT JOIN Artist ON Track.ArtistId = Artist.Id
      LEFT JOIN Album ON Track.AlbumId = Album.Id
      LEFT JOIN Genre ON Track.GenreId = Genre.Id
      ORDER BY Track.Title COLLATE NOCASE
    `).all();
  });
}
