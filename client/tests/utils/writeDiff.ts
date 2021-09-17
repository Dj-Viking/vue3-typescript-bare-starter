import fs from "fs";

// import { PNG } from "pngjs";

//create the diff in here since i can't pass a circular object into the task argument list
// function readshit() {
//   const files = readdirSync(
//     "./tests/e2e/fixtures/screenshots/diff/LoadHome.spec.ts"
//   );
//   return files;
// }

// const files = readshit();
// console.log(files);
// eslint-disable-next-line
export function writeDiff(_args: {
  path: string;
  baselineBlob: Blob;
  actualBlob: Blob;
}): void | boolean | string | Array<string> {
  const { baselineBlob, actualBlob, path } = args;
  try {
    const dir: Array<string> = fs.readdirSync(
      "./tests/e2e/fixtures/screenshots/diff/LoadHome.spec.ts"
    );
    console.log(dir);

    //do the pixelmatch here to create the diff image i guess thats how it works?
    // to modify the diff data after the pixelmatch function?? not sure yet
    // const diff = new PNG({ width, height });

    // writeFile(path, Buffer.from(PNG.sync.write(new PNG(diff))), (err) => {
    //   if (err) throw new Error(err.message);
    // });
    return true;
    // return dir;
  } catch (error) {
    const err = error as Error;
    return err.message;
  }
}
