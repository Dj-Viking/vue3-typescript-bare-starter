import fs from "fs";
import { ColorLog } from "../../../server/src/__tests__/utils/helpers";
import { SCREENSHOTS_BASE_PATH } from "../constants";
const testName = process.env.SPECNAME;

(function () {
  console.log("ENV var passed in", process.env.SPECNAME);

  try {
    const files = fs.readdirSync(`${SCREENSHOTS_BASE_PATH}/${testName}`);
    console.log("files found for test base screenshots", files);
    //delete the file we just found in the base folder
    for (let i = 0; i < files.length; i++) {
      fs.unlink(`${SCREENSHOTS_BASE_PATH}/${testName}/${files[i]}`, (err) => {
        if (err)
          throw new Error(
            `there was an error when trying to delete the file ${err.message}`
          );
      });
    }
    new ColorLog("green", "deleted the base file!").genLog();
  } catch (error) {
    console.error(error);
  }
})();
