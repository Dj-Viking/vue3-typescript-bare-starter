import fs from "fs";
import { ColorLog } from "../../../server/src/__tests__/utils/helpers";

const logger = ColorLog;

export function deleteActuals(path: string): void {
  try {
    const files = fs.readdirSync(path);
    if (!files.length) {
      new logger("yellow", "No files were found in this directory").genLog();
    }

    if (files.length > 0) {
      console.log("files found to delete", files);
      for (let i = 0; i < files.length; i++) {
        fs.unlink(`${path}/${files[i]}`, (err) => {
          if (err) console.error(err);
        });
      }
    }
    //wait for the first read dir to finish
    setTimeout(() => {
      const shouldBeEmpty = fs.readdirSync(path);
      console.log("should be empty", shouldBeEmpty);

      if (!shouldBeEmpty.length) {
        new logger("green", "successfully deleted the files!").genLog();
      }
    }, 300);
  } catch (error) {
    new ColorLog("red", `error while readding dir ${error}`).genLog();
  }
}
