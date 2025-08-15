const path = require('path');
const fs = require('fs');
const jsmediatags = require('jsmediatags');
const Database = require('better-sqlite3');
const crypto = require('crypto');

function removeMIME(str) {
  return str.replace(/(\.mp3)|(\.m4a)|(\.ogg)|(\.wav)/gi, '');
}

function arrayBuff2ImgBuff(picture) {
  // Convert jsmediatags picture to base64 string
  const base64String = Buffer.from(picture.data).toString('base64');
  return `data:image/${picture.type || 'jpg'};base64,${base64String}`;
}

function parseMusicWorker(filePath, config) {
  return new Promise((resolve, reject) => {
    let music = {
      fileInfo: {
        tagType: '',
        path: filePath,
        fileName: path.parse(filePath).name,
        fileExt: path.parse(filePath).ext,
        fileSize: fs.statSync(filePath).size,
        folderName: path.parse(path.parse(filePath).dir).base,
        folderpath: path.parse(filePath).dir,
      },
      tags: {
        title: '',
        artist: '',
        album: '',
        track: '',
        genre: '',
        year: '',
        albumArt: '', // will be set later
        picture: null, // keep raw picture for later
      },
    };
    jsmediatags.read(filePath, {
      onSuccess: function (tag) {
        let { type, tags } = tag;
        music.fileInfo.tagType = type;
        music.tags.title = tags.title;
        music.tags.artist = tags.artist;
        music.tags.album = tags.album;
        music.tags.track = tags.track;
        music.tags.genre = tags.genre;
        music.tags.year = tags.year;
        if (tag && tags.picture && tags.picture.data) {
          music.tags.picture = tags.picture;
        }
        resolve(music);
      },
      onError: async function (error) {
        // Fallback to music-metadata (dynamic import for Node < 22)
        try {
          const mm = await import('music-metadata');
          const metadata = await mm.parseFile(filePath);
          music.tags.title = metadata.common?.title || music.fileInfo.fileName;
          music.tags.artist = metadata.common?.artist || '';
          music.tags.album = metadata.common?.album || '';
          music.tags.track = metadata.common?.track?.no || '';
          music.tags.genre = (metadata.common?.genre && metadata.common.genre.join(',')) || '';
          music.tags.year = metadata.common?.year || '';
          // Album art fallback
          if (metadata.common.picture && metadata.common.picture.length > 0) {
            const picture = metadata.common.picture[0];
            const albumArtPath = path.join(
              config.ALBUM_ART_DIR,
              `${music.tags.album ? music.tags.album : removeMIME(music.fileInfo.fileName)}.${
                picture.format || 'jpg'
              }`
            );
            fs.writeFileSync(String(albumArtPath), Buffer.from(picture.data));
            music.tags.albumArt = albumArtPath;
          }
        } catch (err) {
          // If both fail, just resolve with basic info
        }
        resolve(music);
      },
    });
  });
}

function getOrCreate(db, table, column, value, extra = {}) {
  let row = db.prepare(`SELECT Id FROM ${table} WHERE ${column} = ?`).get(value);
  if (row) return row.Id;
  const cols = [column, ...Object.keys(extra)].join(', ');
  const vals = [value, ...Object.values(extra)];
  const placeholders = vals.map(() => '?').join(', ');
  const stmt = db.prepare(`INSERT INTO ${table} (${cols}) VALUES (${placeholders})`);
  const info = stmt.run(...vals);
  return info.lastInsertRowid;
}

function getFileHash(filePath) {
  const hash = crypto.createHash('sha1');
  const stream = fs.createReadStream(filePath);
  return new Promise((resolve, reject) => {
    stream.on('data', data => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

function getAllSupportedFiles(dir, supportedFileTypes) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      results = results.concat(getAllSupportedFiles(filePath, supportedFileTypes));
    } else {
      const ext = path.extname(filePath).toLowerCase();
      if (supportedFileTypes.includes(ext)) {
        results.push(filePath);
      }
    }
  }
  return results;
}

process.on('message', async ({ folders, config }) => {
  console.log('Starting music scan worker...');

  const dbPath = path.join(config.APP_CONF_FOLDER, 'data.db');
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  let scanned = 0;
  const supportedFileTypes = ['.mp3', '.wav', '.ogg', '.aac', '.flac', '.webm', '.m4a'];
  try {
    for (const folder of folders) {
      // Do NOT add subdirectories to MusicFolder
      // Just scan files and set Track.folderpath
      const supportedFiles = getAllSupportedFiles(folder.Uri, supportedFileTypes);
      let folderScanned = 0;
      for (const filePath of supportedFiles) {
        try {
          const fileHash = await getFileHash(filePath);
          const musicInfo = await parseMusicWorker(filePath, config);
          // Get or create Artist
          const artistId = musicInfo.tags.artist
            ? getOrCreate(db, 'Artist', 'Name', musicInfo.tags.artist)
            : null;
          // Get or create Genre
          const genreId = musicInfo.tags.genre
            ? getOrCreate(db, 'Genre', 'Name', musicInfo.tags.genre)
            : null;
          // Get or create Album (get albumId first)
          let albumId = null;
          if (musicInfo.tags.album) {
            albumId = getOrCreate(db, 'Album', 'Title', musicInfo.tags.album, {
              ArtistId: artistId,
              GenreId: genreId,
            });
          }
          // Save album art using albumId as file name
          let albumArt = '';
          if (albumId && musicInfo.tags.picture) {
            const albumArtPath = path.join(config.ALBUM_ART_DIR, `${albumId}.jpg`);
            if (!fs.existsSync(albumArtPath)) {
              const base64Img = arrayBuff2ImgBuff(musicInfo.tags.picture);
              const base64Data = base64Img.split(',')[1];
              if (base64Data) {
                let b = Buffer.from(base64Data, 'base64');
                fs.writeFileSync(String(albumArtPath), b);
              }
            }
            albumArt = albumArtPath;
          }
          // Ensure folderpath is set for each track
          const folderpath = path.parse(filePath).dir;
          const trackRow = db.prepare('SELECT * FROM Track WHERE Uri = ?').get(filePath);
          let trackTitle =
            musicInfo.tags.title && musicInfo.tags.title.trim()
              ? musicInfo.tags.title
              : musicInfo.fileInfo.fileName;
          if (!trackRow) {
            db.prepare(
              `INSERT INTO Track (Uri, Extension, Title, ArtistId, AlbumId, GenreId, TrackNumber, Year, AlbumArt, FileHash, DateAdded, Version, FolderPath)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            ).run(
              filePath,
              musicInfo.fileInfo.fileExt,
              trackTitle,
              artistId,
              albumId,
              genreId,
              musicInfo.tags.track,
              musicInfo.tags.year,
              albumArt,
              fileHash,
              Date.now(),
              1,
              folderpath
            );
            scanned++;
            folderScanned++;
          } else if (trackRow.FileHash !== fileHash) {
            db.prepare(
              `UPDATE Track SET Extension = ?, Title = ?, ArtistId = ?, AlbumId = ?, GenreId = ?, TrackNumber = ?, Year = ?, AlbumArt = ?, FileHash = ?, DateAdded = ?, Version = ?, FolderPath = ? WHERE Id = ?`
            ).run(
              musicInfo.fileInfo.fileExt,
              trackTitle,
              artistId,
              albumId,
              genreId,
              musicInfo.tags.track,
              musicInfo.tags.year,
              albumArt,
              fileHash,
              Date.now(),
              1,
              folderpath,
              trackRow.Id
            );
            scanned++;
            folderScanned++;
          }
        } catch (err) {
          console.error('DB Insert/Update Error:', err);
        }
      }
      console.log(
        `Scanned ${folderScanned} out of ${supportedFiles.length} files in folder: ${folder.Uri}`
      );
    }
    process.send({ success: true, scanned });
    // Remove tracks whose files are not in any current MusicFolder
    let validPaths = [];
    for (const folder of folders) {
      // Recursively get all supported files for validPaths
      validPaths = validPaths.concat(getAllSupportedFiles(folder.Uri, supportedFileTypes));
    }
    const allTracks = db.prepare('SELECT Id, Uri FROM Track').all();
    let removed = 0;
    for (const track of allTracks) {
      if (!validPaths.includes(track.Uri)) {
        db.prepare('DELETE FROM Track WHERE Id = ?').run(track.Id);
        removed++;
      }
    }
    if (removed > 0) {
      console.log(`Removed ${removed} tracks not in any current MusicFolder.`);
    }
    // Clean up orphaned Album, Artist, Genre
    db.prepare(
      'DELETE FROM Album WHERE Id NOT IN (SELECT AlbumId FROM Track WHERE AlbumId IS NOT NULL)'
    ).run();
    db.prepare(
      'DELETE FROM Artist WHERE Id NOT IN (SELECT ArtistId FROM Track WHERE ArtistId IS NOT NULL)'
    ).run();
    db.prepare(
      'DELETE FROM Genre WHERE Id NOT IN (SELECT GenreId FROM Track WHERE GenreId IS NOT NULL)'
    ).run();
  } catch (error) {
    process.send({ success: false, error: error.message });
  }
});
