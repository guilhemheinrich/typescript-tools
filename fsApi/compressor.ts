import * as archiver from 'archiver'
import * as fs from 'fs-extra'
import extract from 'extract-zip'

export function zip_folder(souce_path: string, destination_path: string, options?: archiver.ArchiverOptions) {
  let output = fs.createWriteStream(destination_path);
  
  let archive = archiver.create("zip", options)
  output.on('close', function () {
      console.log(archive.pointer() + ' total bytes');
      console.log('archiver has been finalized and the output file descriptor has closed.');
  });
  archive.pipe(output)
  archive.directory(souce_path, false);
  return archive.finalize();
}

export async function extract_zip(souce_path: string, destination_path: string) {
  try {
    return extract(souce_path, { dir: destination_path })
  } catch (err) {
    console.log(err)
  }
}


// extract_zip('D:/code/etl-sygnal-checker/out/extracted.zip', 'D:/code/etl-sygnal-checker/out')