import { LOCALHOST_URL } from "tests/constants";
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
const matchNum = 0;

describe("login-page-regression", () => {
  it("visits the login page", () => {
    cy.visit(LOCALHOST_URL);
  });
});
