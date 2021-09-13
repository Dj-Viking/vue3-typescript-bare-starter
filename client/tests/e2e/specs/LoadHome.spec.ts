import { LOCALHOST_URL } from "../../constants";

describe("Check-the-nav-bar-for-the-correct-nav-links", () => {
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
