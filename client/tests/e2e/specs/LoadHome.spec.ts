import {
  ACTUALS_LOADHOMESPEC_PATH,
  BASE_HOMELINK_VIEW_FIXTURE,
  LOCALHOST_URL,
  ACTUAL_HOMELINK_VIEW_FIXTURE,
  DIFF_FIXTURE_FOLDER_PATH,
} from "../../constants";

import { PNG, PNGWithMetadata } from "pngjs";
import Pixelmatch from "pixelmatch";

let baselinePng: PNGWithMetadata;
const baseDimensions = {
  width: 0,
  height: 0,
};
let actualPng: PNGWithMetadata;
const actualDimensions = {
  width: 0,
  height: 0,
};
let diff: PNG;
let matchNum = 123;

describe("Check-the-nav-bar-for-the-correct-nav-links", () => {
  it("runs the delete actual png task plugin", () => {
    cy.task("deleteActuals", ACTUALS_LOADHOMESPEC_PATH).then((dirOrNull) => {
      console.log(dirOrNull);
    });
  });

  it("visit's home page", () => {
    cy.visit(LOCALHOST_URL);
  });
  it("checks the home link", () => {
    cy.get("a.link").contains("Home").should("have.length", 1);
  });
  it("checks the login link", () => {
    cy.get("a.link").contains("Login").should("have.length", 1);
  });
  it("checks the signup link", () => {
    cy.get("a.link").contains("Signup").should("have.length", 1);
  });
  it("screenshots-the-home-view-window", () => {
    cy.get("a.link").contains("Home").screenshot({ capture: "viewport" });
  });
  // it("screenshots-the-home-view-window", () => {
  //   cy.get("html").screenshot({ capture: "viewport" });
  // });
});

describe("unit-test-home-link", () => {
  it("get the baseline png of home link", () => {
    cy.fixture(
      /screenshots-the-home-view-window.png/g.test(BASE_HOMELINK_VIEW_FIXTURE)
        ? BASE_HOMELINK_VIEW_FIXTURE
        : "not found"
    )
      .then(Cypress.Blob.base64StringToBlob)
      .then(async (fileBlob: Blob) => {
        const fileArrayBuffer = await fileBlob.arrayBuffer();
        baselinePng = PNG.sync.read(
          Buffer.from(new Uint8Array(fileArrayBuffer))
        );
        baseDimensions.height = baselinePng.height;
        baseDimensions.width = baselinePng.width;
        console.log("baseline png", baselinePng);
      });
  });

  it("get the actual png of the home link", () => {
    cy.fixture(
      /screenshots-the-home-view-window.png/.test(ACTUAL_HOMELINK_VIEW_FIXTURE)
        ? ACTUAL_HOMELINK_VIEW_FIXTURE
        : "actual png not found"
    )
      .then(Cypress.Blob.base64StringToBlob)
      .then(async (fileBlob: Blob) => {
        const fileArrayBuffer = await fileBlob.arrayBuffer();
        actualPng = PNG.sync.read(Buffer.from(new Uint8Array(fileArrayBuffer)));
        actualDimensions.height = actualPng.height;
        actualDimensions.width = actualPng.width;
        console.log("actual png", actualPng);
      });
  });

  it("write the diff to disk only if the dimensions are the same", () => {
    expect(baseDimensions.height).to.equal(actualDimensions.height);
    expect(baseDimensions.width).to.equal(actualDimensions.width);
    console.log("write diff task args", {
      testName: "LoadHome.spec.ts",
      writePath: DIFF_FIXTURE_FOLDER_PATH,
      fileName:
        "Check-the-nav-bar-for-the-correct-nav-links -- screenshots-the-home-view-window.png",
    });

    cy.task("writeDiff", {
      testName: "LoadHome.spec.ts",
      writePath: DIFF_FIXTURE_FOLDER_PATH,
      fileName:
        "Check-the-nav-bar-for-the-correct-nav-links -- screenshots-the-home-view-window.png",
    }).then((resultOrNull) => {
      console.log("home link write diff result", resultOrNull);
    });
  });

  it("calculate the diff between base and actual", () => {
    const { width, height } = baselinePng;
    diff = new PNG({ width, height });
    console.log("home link initial diff image", diff);
    const threshold = 0.1;

    matchNum = Pixelmatch(
      baselinePng.data,
      actualPng.data,
      diff.data,
      width,
      height,
      { threshold }
    );

    console.log("\x1b[32m", "match num value", matchNum, "\x1b[00m");

    if (matchNum === 0) {
      //run the delete diff task since the pictures match we dont need to see the diff image.
      cy.task("deleteDiff", "LoadHome.spec.ts");
    }

    expect(matchNum).to.equal(0);
  });
});
