import { BrowserWindow, dialog, ipcMain, nativeTheme, shell } from 'electron';
import { prevIcon, nextIcon, playIcon, pauseIcon } from '../thumbarIcons';
import { parseDir, parseMusic } from '../modules/FileParser';
import dbModule from '../../database';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db: any = dbModule;
import path from 'path';
import fs from 'fs';
import { fork } from 'child_process';
import {
  APP_CONF_FOLDER,
  MUSIC_DIR,
  ALBUM_ART_DIR,
  ARTIST_ART_DIR,
} from '../../config/core_config';

function sendMessageToRendererProcess(
  window: BrowserWindow,
  message: string,
  payload?: unknown
): void {
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

  // ── Thumbnail toolbar (Windows taskbar media controls) ──────────────────────
  let thumbarIsPlaying = false; // track state for window restore

  function updateThumbar(isPlaying) {
    if (process.platform !== 'win32') return;
    thumbarIsPlaying = isPlaying;
    try {
      mainWin.setThumbarButtons([
        {
          tooltip: 'Previous',
          icon: prevIcon,
          click() {
            sendMessageToRendererProcess(mainWin, 'thumbar-prev');
          },
        },
        {
          tooltip: isPlaying ? 'Pause' : 'Play',
          icon: isPlaying ? pauseIcon : playIcon,
          click() {
            sendMessageToRendererProcess(mainWin, 'thumbar-toggle');
          },
        },
        {
          tooltip: 'Next',
          icon: nextIcon,
          click() {
            sendMessageToRendererProcess(mainWin, 'thumbar-next');
          },
        },
      ]);
    } catch (e) {
      console.warn('setThumbarButtons failed:', e.message);
    }
  }

  // Renderer tells us when play state changes so we can flip the icon
  ipcMain.on('thumbar-update', (_, { isPlaying }) => {
    updateThumbar(isPlaying);
  });

  // Register after window is shown (setThumbarButtons requires a visible HWND)
  mainWin.on('show', () => updateThumbar(thumbarIsPlaying));

  // Windows clears thumbar on minimize/restore — re-register on restore
  mainWin.on('restore', () => updateThumbar(thumbarIsPlaying));

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
      ARTIST_ART_DIR,
    };

    // Spawn a worker process for scanning
    const worker = fork(path.resolve(process.cwd(), 'src', 'main', 'utils', 'musicScanWorker.js'));
    worker.send({ folders, config });

    return new Promise((resolve, reject) => {
      worker.on('message', rawMsg => {
        const msg = rawMsg as { success: boolean; scanned: number; error: string };
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

  db.prepare(
    `
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
    Version INTEGER,
    FolderPath TEXT
  )
`
  ).run();

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
    return db
      .prepare(
        `
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
    `
      )
      .all();
  });

  // Search functionality
  ipcMain.handle('search-library', (e, { query }) => {
    if (!query || query.trim().length === 0) {
      return {
        songs: [],
        albums: [],
        artists: [],
        albumArtists: [],
        genres: [],
        years: [],
        folders: [],
        playlists: [],
      };
    }

    const searchPattern = `%${query}%`;
    const exactQuery = query.toLowerCase();

    try {
      // Search songs
      const songs = db
        .prepare(
          `
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
        WHERE Track.Title LIKE ? COLLATE NOCASE
        ORDER BY 
          CASE WHEN LOWER(Track.Title) = ? THEN 0 ELSE 1 END,
          Track.Title COLLATE NOCASE
        LIMIT 10
      `
        )
        .all(searchPattern, exactQuery);

      // Search albums
      const albums = db
        .prepare(
          `
        SELECT
          Album.Id,
          Album.Title,
          Album.CoverUri,
          Album.ReleaseYear,
          Artist.Name AS ArtistName,
          COUNT(Track.Id) AS SongCount
        FROM Album
        LEFT JOIN Artist ON Album.ArtistId = Artist.Id
        LEFT JOIN Track ON Album.Id = Track.AlbumId
        WHERE Album.Title LIKE ? COLLATE NOCASE
        GROUP BY Album.Id
        ORDER BY 
          CASE WHEN LOWER(Album.Title) = ? THEN 0 ELSE 1 END,
          Album.Title COLLATE NOCASE
        LIMIT 10
      `
        )
        .all(searchPattern, exactQuery);

      // Search artists
      const artists = db
        .prepare(
          `
        SELECT
          Artist.Id,
          Artist.Name,
          Artist.ProfileImgUri,
          COUNT(DISTINCT Track.Id) AS SongCount
        FROM Artist
        LEFT JOIN Track ON Artist.Id = Track.ArtistId
        WHERE Artist.Name LIKE ? COLLATE NOCASE
        GROUP BY Artist.Id
        ORDER BY 
          CASE WHEN LOWER(Artist.Name) = ? THEN 0 ELSE 1 END,
          Artist.Name COLLATE NOCASE
        LIMIT 10
      `
        )
        .all(searchPattern, exactQuery);

      // Search album artists (same as artists for now)
      const albumArtists = db
        .prepare(
          `
        SELECT
          Artist.Id,
          Artist.Name,
          Artist.ProfileImgUri,
          COUNT(DISTINCT Album.Id) AS AlbumCount
        FROM Artist
        LEFT JOIN Album ON Artist.Id = Album.ArtistId
        WHERE Artist.Name LIKE ? COLLATE NOCASE
        GROUP BY Artist.Id
        ORDER BY 
          CASE WHEN LOWER(Artist.Name) = ? THEN 0 ELSE 1 END,
          Artist.Name COLLATE NOCASE
        LIMIT 10
      `
        )
        .all(searchPattern, exactQuery);

      // Search genres
      const genres = db
        .prepare(
          `
        SELECT
          Genre.Id,
          Genre.Name,
          COUNT(Track.Id) AS SongCount
        FROM Genre
        LEFT JOIN Track ON Genre.Id = Track.GenreId
        WHERE Genre.Name LIKE ? COLLATE NOCASE
        GROUP BY Genre.Id
        ORDER BY 
          CASE WHEN LOWER(Genre.Name) = ? THEN 0 ELSE 1 END,
          Genre.Name COLLATE NOCASE
        LIMIT 10
      `
        )
        .all(searchPattern, exactQuery);

      // Search years
      const years = db
        .prepare(
          `
        SELECT
          Track.Year AS Name,
          COUNT(Track.Id) AS SongCount
        FROM Track
        WHERE Track.Year LIKE ? AND Track.Year IS NOT NULL AND Track.Year != ''
        GROUP BY Track.Year
        ORDER BY Track.Year DESC
        LIMIT 10
      `
        )
        .all(searchPattern);

      // Search folders
      const folders = db
        .prepare(
          `
        SELECT
          Track.FolderPath AS Name,
          COUNT(Track.Id) AS SongCount
        FROM Track
        WHERE Track.FolderPath LIKE ? COLLATE NOCASE AND Track.FolderPath IS NOT NULL
        GROUP BY Track.FolderPath
        ORDER BY 
          CASE WHEN LOWER(Track.FolderPath) = ? THEN 0 ELSE 1 END,
          Track.FolderPath COLLATE NOCASE
        LIMIT 10
      `
        )
        .all(searchPattern, exactQuery);

      // Playlists would need a separate table - returning empty for now
      const playlists = [];

      const results = {
        songs: songs.map(s => ({
          Id: s.Id,
          Title: s.Title,
          Uri: s.Uri,
          Extension: s.Extension,
          Year: s.Year,
          TrackNumber: s.TrackNumber,
          AlbumArt: s.AlbumArt,
          Duration: s.Duration,
          ArtistName: s.ArtistName,
          AlbumTitle: s.AlbumTitle,
          GenreName: s.GenreName,
        })),
        albums: albums.map(a => ({
          id: a.Id,
          title: a.Title,
          artist: a.ArtistName,
          year: a.ReleaseYear,
          songCount: a.SongCount,
          coverUri: a.CoverUri,
        })),
        artists: artists.map(a => ({
          id: a.Id,
          title: a.Name,
          songCount: a.SongCount,
          profileImg: a.ProfileImgUri,
        })),
        albumArtists: albumArtists.map(a => ({
          id: a.Id,
          title: a.Name,
          albumCount: a.AlbumCount,
          profileImg: a.ProfileImgUri,
        })),
        genres: genres.map(g => ({
          id: g.Id,
          title: g.Name,
          songCount: g.SongCount,
        })),
        years: years.map(y => ({
          id: y.Name,
          title: y.Name,
          songCount: y.SongCount,
        })),
        folders: folders.map(f => ({
          id: f.Name,
          title: f.Name,
          songCount: f.SongCount,
        })),
        playlists,
      };

      return results;
    } catch (error) {
      return {
        songs: [],
        albums: [],
        artists: [],
        albumArtists: [],
        genres: [],
        years: [],
        folders: [],
        playlists: [],
      };
    }
  });

  // ── Auto-scan library folders on app load ─────────────────────────────────
  mainWin.webContents.once('did-finish-load', () => {
    const folders = db.prepare('SELECT * FROM MusicFolder').all();
    if (!folders.length) return;

    const config = {
      APP_CONF_FOLDER,
      MUSIC_DIR,
      ALBUM_ART_DIR,
      ARTIST_ART_DIR,
    };

    const worker = fork(
      path.resolve(process.cwd(), 'src', 'main', 'utils', 'musicScanWorker.js')
    );
    worker.send({ folders, config });

    worker.on('message', rawMsg => {
      const msg = rawMsg as { success: boolean; scanned: number; error: string };
      if (msg.success) {
        console.log(`[Auto-scan] Found ${msg.scanned} new/updated file(s).`);
        sendMessageToRendererProcess(mainWin, 'library-updated', { scanned: msg.scanned });
      }
    });
    worker.on('error', err => console.error('[Auto-scan] Worker error:', err));
  });
}
