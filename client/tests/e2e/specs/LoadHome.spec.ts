import {
  ACTUALS_LOADHOMESPEC_PATH,
  BASE_HOMELINK_VIEW_FIXTURE,
  LOCALHOST_URL,
  ACTUAL_HOMELINK_VIEW_FIXTURE,
} from "../../constants";

import { PNG, PNGWithMetadata } from "pngjs";
import pixelmatch from "pixelmatch";
// import pixelmatch from "pixelmatch";

let baselinePng: PNGWithMetadata;
let actualPng: PNGWithMetadata;

describe("Check-the-nav-bar-for-the-correct-nav-links", () => {
  it("checks the task defined in plugins", () => {
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
    cy.get("a.link").contains("Home").screenshot();
  });
});

describe("regression-test-home-link", () => {
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
        console.log("baseline png", baselinePng);
      });
  });

  it("get the actual baseline png of the home link", () => {
    cy.fixture(
      /screenshots-the-home-view-window.png/.test(ACTUAL_HOMELINK_VIEW_FIXTURE)
        ? ACTUAL_HOMELINK_VIEW_FIXTURE
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
