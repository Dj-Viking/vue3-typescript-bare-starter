import pixelmatch from "pixelmatch";
import {
  ACTUAL_HOME_FULL_PAGE,
  BASE_HOME_FULL_PAGE,
  LOCALHOST_URL,
} from "tests/constants";
import { PNG, PNGWithMetadata } from "pngjs";
// import pixelmatch from "pixelmatch";

let baselinePng: PNGWithMetadata;
let actualPng: PNGWithMetadata;

describe("regression", () => {
  it("visits the local host page", () => {
    cy.visit(LOCALHOST_URL);
  });
  it("screenshots the homepage", () => {
    cy.get("html").screenshot();
  });

  it("get the baseline png of home link", () => {
    cy.fixture(
      /screenshots-the-home-view-window.png/g.test(BASE_HOME_FULL_PAGE)
        ? BASE_HOME_FULL_PAGE
        : "not found"
    )
      .then(Cypress.Blob.base64StringToBlob)
      .then(async (fileBlob: Blob) => {
        const fileArrayBuffer = await fileBlob.arrayBuffer();
        baselinePng = PNG.sync.read(
          Buffer.from(new Uint8Array(fileArrayBuffer))
        );
        console.log("baseline png", baselinePng);
      });
  });

  it("get the actual baseline png of the home link", () => {
    cy.fixture(
      /screenshots-the-home-view-window.png/.test(ACTUAL_HOME_FULL_PAGE)
        ? ACTUAL_HOME_FULL_PAGE
        : "not found"
    )
      .then(Cypress.Blob.base64StringToBlob)
      .then(async (fileBlob: Blob) => {
        const fileArrayBuffer = await fileBlob.arrayBuffer();
        actualPng = PNG.sync.read(Buffer.from(new Uint8Array(fileArrayBuffer)));
        console.log("actual png", actualPng);
      });
  });

  it("calculate the diff between base and actual", () => {
    const { width, height } = baselinePng;
    const diff = new PNG({ width, height });
    console.log("diff image", diff);
    const threshold = 0.1;

    const matchNum: number = pixelmatch(
      baselinePng.data,
      actualPng.data,
      diff.data,
      width,
      height,
      { threshold }
    );

    expect(matchNum).to.equal(0);
  });
});
