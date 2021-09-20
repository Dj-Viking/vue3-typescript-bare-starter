import { LOCALHOST_URL, EMAIL, PASSWORD } from "tests/constants";

describe("login-unit-test, tests login functionality", () => {
  it("visits the site login page", () => {
    cy.visit(LOCALHOST_URL);
  });
  it("clicks login router link to navigate to the login page", () => {
    cy.get("a.link").contains("Login").should("have.length", 1).click();
  });
});

describe("tests login with incorrect credentials, has error message", () => {
  //clear inputs after this is done so the next test can run just fine
  it("types in incorrect email", () => {
    cy.get("input[name=email]").should("have.length", 1).type("ksdkjfkdjfd");
  });
  it("types in incorrect password", () => {
    cy.get("input[name=password]").should("have.length", 1).type("dsafsdf");
  });
  it("clicks submit button", () => {
    cy.get("button").contains("Login").should("have.length", 1).click();
  });
  it("checks that error message appears", () => {
    cy.get("p")
      .contains("Error: Incorrect Credentials")
      .should("have.length", 1);
  });
  it("clears the inputs", () => {
    cy.get("input[name=email]").clear();
    cy.get("input[name=password]").clear();
  });
});

describe("tests the login with correct credentials works, has success message, and navigates back to home page", () => {
  it("types in email", () => {
    cy.get("input[name=email]").should("have.length", 1).type(EMAIL);
  });
  it("types in password", () => {
    cy.get("input[name=password]").should("have.length", 1).type(PASSWORD);
  });
  it("clicks the submit button", () => {
    cy.get("button").contains("Login").should("have.length", 1).click();
  });
  it("checks that success message appears ", () => {
    cy.wait(100);
    cy.get("p")
      .contains("Success! Teleporting to Home Page!")
      .should("have.length", 1);
  });
  it("waits a bit and checks we are back at the home page, i.e. checking if the add todo button is on the page, and that local storage has a token, and localstorage has a global email set", () => {
    cy.wait(2000);
    cy.get("button").contains("Add todo");
    //not sure why the assertion only works here but okay
    // cypress trashes local storage during the test to prevent buildup of state or something like that
    cy.window().then((window: Cypress.AUTWindow) => {
      const token = window.localStorage.getItem("id_token");
      const email = window.localStorage.getItem("global_email");
      expect(email).to.equal(EMAIL);
      expect(token).to.not.be.null;
    });
  });
});
