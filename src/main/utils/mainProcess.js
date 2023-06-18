import { BrowserWindow, app, dialog, ipcMain, ipcRenderer, shell } from 'electron';
import fs from 'fs';
import path from 'path';
import { parseDir, parseMusic } from '../modules/FileParser';
import { APP_CONF_FOLDER } from '../../config/core_config';

export default function mainIpcs(mainWin) {
   ipcMain.on('minimize', () => mainWin.minimize());
   ipcMain.on('maximize', () => {
      if (mainWin.isMaximized()) {
         mainWin.unmaximize();
         mainWin.center();
      } else {
         mainWin.maximize();
      }
   });

   ipcMain.on('closeWindow', () => {
      mainWin.close();
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

   ipcMain.once('show-file-picker', async (e, payload) => {
      const { title } = payload;
      let myTracks = [];
      dialog
         .showOpenDialog(mainWin, {
            title: 'Select Music Folder',
            properties: ['openDirectory'],
         })
         .then(async result => {
            if (result.canceled) {
               console.log('Dialog was canceled');
            } else {
               const folder = result.filePaths[0];
               try {
                  // console.log(folder);
                  ipcMain.on('process-files', folder);

                  // SongsPathList.forEach(songPath => {
                  //    const SongInfo = parseMusic(songPath);

                  //    SongInfo.then(song => {
                  //       console.info('Info', song);
                  //    });
                  // });

                  // const checFun = async () => {};
                  // await checFun();
                  // const folderCont = fs
                  //    .readdirSync(folder)
                  //    .map(content => path.join(folder, content))
                  //    .map(content => path.parse(content))
                  //    .map(pathObject => {
                  //       const po = { name: pathObject.name, extension: pathObject.ext };
                  //       return po;
                  //    });
                  // const subFolders = folderCont
                  //    .filter(content => content.extension == '')
                  //    .map(subFolder => path.join(folder, subFolder.name));
                  // file;
                  // console.log(myList);
                  // console.log(subFolders);
                  // previewWin.loadURL(`file://${file}`);
               } catch (e) {
                  console.log(e);
               }
            }
         })
         .catch(err => {
            console.log(err);
         });
   });
}
