/**
 * localhost domain for the vue app
 */
export const LOCALHOST_URL = "http://localhost:8080/";

/**
 * path to the actuals screenshots folder
 * for some reason I have to use this path because when running the fs function with the path ../ it starts from the root folder of this repository project
 */
export const ACTUALS_LOADHOMESPEC_PATH =
  "../client/tests/e2e/fixtures/screenshots/actuals/LoadHome.spec.ts";
/**
 * path to the actuals screenshots folder
 * for some reason I have to use this path because when running the fs function with the path ../ it starts from the root folder of this repository project
 */
export const ACTUALS_HOMEREGRESSIONSPEC_PATH =
  "../client/tests/e2e/fixtures/screenshots/actuals/HomeRegression.spec.ts";

export const ACTUALS_LOGINREGRESSIONSPEC_PATH =
  "../client/tests/e2e/fixtures/screenshots/actuals/LoginRegression.spec.ts";

/**
 * path the the base home link screenshot fixture
 */
export const BASE_HOMELINK_VIEW_FIXTURE =
  "/screenshots/base/LoadHome.spec.ts/Check-the-nav-bar-for-the-correct-nav-links -- screenshots-the-home-view-window.png";

/**
 * path to the actual home link screenshot fixture
 */
export const ACTUAL_HOMELINK_VIEW_FIXTURE =
  "/screenshots/actuals/LoadHome.spec.ts/Check-the-nav-bar-for-the-correct-nav-links -- screenshots-the-home-view-window.png";
/**
 * path to the actual home link screenshot fixture
 */
export const DIFF_FIXTURE_FOLDER_PATH = "./tests/e2e/fixtures/screenshots/diff";

/**
 * match num calculation path to the base png file
 */
export const PATH_TO_ACTUAL_FROM_TASK_FUNCTION =
  "./tests/e2e/fixtures/screenshots/actuals/LoadHome.spec.ts/Check-the-nav-bar-for-the-correct-nav-links -- screenshots-the-home-view-window.png";

/**
 * match num calculation path to the base png file
 */
export const PATH_TO_BASE_FROM_TASK_FUNCTION =
  "./tests/e2e/fixtures/screenshots/base/LoadHome.spec.ts/Check-the-nav-bar-for-the-correct-nav-links -- screenshots-the-home-view-window.png";

/**
 * path to the actual home link screenshot fixture
 */
export const BASE_HOME_FULL_PAGE_FIXTURE =
  "/screenshots/base/HomeRegression.spec.ts/home-page-regression -- screenshots-the-entire-page";

/**
 * path to the actual home link screenshot fixture
 */
export const ACTUAL_HOME_FULL_PAGE_FIXTURE =
  "/screenshots/actuals/HomeRegression.spec.ts/home-page-regression -- screenshots-the-entire-page";
