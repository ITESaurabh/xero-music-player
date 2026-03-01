import fs from 'fs';
import path from 'path';
import jsmediatags from 'jsmediatags';
import { ALBUM_ART_DIR } from '../../config/core_config';
import { ArrayBuff2ImgBuff } from '../utils/misc';

const supportedFileTypes: string[] = ['.mp3', '.wav', '.ogg', '.aac', '.flac', '.webm', '.m4a'];

export interface MusicFileInfo {
  tagType: string;
  path: string;
  fileName: string;
  fileExt: string;
  fileSize: number;
  folderName: string;
  folderpath: string;
}

export interface MusicTags {
  title: string | undefined;
  artist: string | undefined;
  album: string | undefined;
  track: string | undefined;
  genre: string | undefined;
  year: string | undefined;
  albumArt: string;
}

export interface MusicInfo {
  fileInfo: MusicFileInfo;
  tags: MusicTags;
}

export interface PictureData {
  data: number[];
  format: string;
  type?: string;
}

export interface JsmediatagsTag {
  type: string;
  tags: {
    title?: string;
    artist?: string;
    album?: string;
    track?: string;
    genre?: string;
    year?: string;
    picture?: PictureData;
  };
}

export function parseDir(dirPath: string, arrayOfFiles: string[] = []): string[] {
  const files = fs.readdirSync(dirPath);

  (function iterator(files: string[]) {
    files.forEach(function (file) {
      const isSupported = supportedFileTypes.includes(path.parse(file).ext);
      if (fs.statSync(dirPath + '/' + file).isDirectory()) {
        arrayOfFiles = parseDir(dirPath + '/' + file, arrayOfFiles);
      } else {
        if (isSupported) {
          arrayOfFiles.push(path.join(dirPath, '/', file));
        }
      }
    });
    return arrayOfFiles;
  })(files);

  return arrayOfFiles;
}

function removeMIME(str: string): string {
  return str.replace(/(\.mp3)|(\.m4a)|(\.ogg)|(\.wav)/gi, '');
}

export function parseMusic(musicPath: string): Promise<MusicInfo> {
  return new Promise(resolve => {
    const music: MusicInfo = {
      fileInfo: {
        tagType: '',
        path: musicPath,
        fileName: path.parse(musicPath).name,
        fileExt: path.parse(musicPath).ext,
        fileSize: fs.statSync(musicPath).size,
        folderName: path.parse(path.parse(musicPath).dir).base,
        folderpath: path.parse(musicPath).dir,
      },
      tags: {
        title: '',
        artist: '',
        album: '',
        track: '',
        genre: '',
        year: '',
        albumArt: '',
      },
    };

    jsmediatags.read(musicPath, {
      onSuccess: function (tag: JsmediatagsTag) {
        const { type, tags } = tag;
        console.log('MUSC:', music, tags);
        music.fileInfo.tagType = type;
        music.tags.title = tags.title;
        music.tags.artist = tags.artist;
        music.tags.album = tags.album;
        music.tags.track = tags.track;
        music.tags.genre = tags.genre;
        music.tags.year = tags.year;
        if (tag && tags.picture && tags.picture.data) {
          tags.picture.type = tags.picture.type ? tags.picture.type.replace(/image\//g, '') : 'jpg';

          const albumArtPath = path.join(
            ALBUM_ART_DIR,
            `${music.tags.album ? music.tags.album : removeMIME(music.fileInfo.fileName)}.${'jpg'}`
          );

          const base64Img = ArrayBuff2ImgBuff(tags.picture);
          const m = base64Img.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
          if (m) {
            const b = Buffer.from(m[2], 'base64');
            fs.writeFile(String(albumArtPath), b, function (err) {
              if (err) {
                console.log(tags.title, err);
              } else {
                console.log('The file has been saved!');
              }
            });
          }
          music.tags.albumArt = albumArtPath;
        }
        resolve(music);
      },
      onError: function (error: { type: string; info: string }) {
        console.log(':(', musicPath, path.parse(musicPath).name, error.type, error.info);
      },
    });
  });
}
