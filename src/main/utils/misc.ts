import fs from 'fs';

export interface PictureObject {
  data: number[];
  format: string;
  type?: string;
}

export function writeImageBuffer(imageBuffer: Buffer, savePath: string): void {
  try {
    fs.writeFileSync(savePath, imageBuffer);
  } catch (err) {
    console.log('An error occured while Saving Object to File.');
    console.log(err);
  }
}

export function ArrayBuff2ImgBuff(PictureObj: PictureObject): string {
  const { data, format } = PictureObj;
  const btoa = (text: string): string => {
    return Buffer.from(text, 'binary').toString('base64');
  };

  let base64String = '';
  for (let i = 0; i < data.length; i++) {
    base64String += String.fromCharCode(data[i]);
  }
  return `data:${format};base64,${btoa(base64String)}`;
}
