import { LOCALHOST_URL } from "tests/constants";

const inputText = "input from the test";
// const editText = "some edited text";

describe("visits home page", () => {
  it("visits home page", () => {
    cy.visit(LOCALHOST_URL);
  });
});

describe("checks all CRUD operations of interactions with todos as not logged in", () => {
  it("while not logged in creates a todo", () => {
    cy.get("input[name=textInput]").type(inputText);
    cy.get("button").contains("Add todo").click();
  });
  it("checks that the todo that was added has the text we input previously", () => {
    // cy.get()
  });
  it("checks that we can edit the todo", () => {
    //edits and asserts that the todo we edited has text that matched the editText variable
    // cy.get()
  });
  it("checks we can delete a todo", () => {
    //deletes and asserts that the todo with the edited text is gone
  });
});

describe("registers a new user that will crud the todos", () => {
  //sign in as new user
  //check that the todos are empty for a newly signed in user comes to home page
});

describe("checks all CRUD operations of todos as logged in", () => {
  // it("creates", () => {});
  // check error if creates with expired token
  // it("creates with expired token should show correct error message", () => {})
  // it("checks it was created", () => {
  // can check by refreshing which should query the user's todos and should all appear
  //});
  // it("edits", () => {});
  // it("checks it was edited", () => {});
  // it("deletes", () => {});
  // it("checks it was deleted", () => {});
  // it("clears all todos", () => {});
  // it("checks all todos were cleared", () => {})
});
