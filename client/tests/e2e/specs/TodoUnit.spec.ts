import {
  LOCALHOST_URL,
  REGISTER_USERNAME,
  REGISTER_EMAIL,
  REGISTER_PASSWORD,
} from "../../constants";

let unique_username = "";
let unique_email = "";
let token: string | null = "";

const inputText = "input from the test";
const editText = "some edited text";

describe("visits home page", () => {
  it("visits home page", () => {
    cy.visit(LOCALHOST_URL);
  });
});

describe("checks all CRUD operations of interactions with cards as not logged in", () => {
  it("while not logged in creates a card", () => {
    cy.get("input[name=textInput]").type(inputText);
    cy.get("button").contains("Add Card").click();
  });
  it("checks that the card that was added has the text we input previously", () => {
    //get the container of the cardlist and traverse down to the card that got added below the default one
    cy.get("div.some-unique-class")
      .children()
      .eq(1)
      .children()
      .eq(2)
      .children()
      .first()
      .contains(inputText);
  });

  //make an edit modal first to have input elements to select and type in...cant seem to find a use to test the window prompt in cypress
  // it("checks that we can edit the card", () => {
  //   //edits and asserts that the card we edited has text that matched the editText variable
  //   cy.get("div.some-unique-class")
  //     .children()
  //     .eq(1)
  //     .children()
  //     .eq(2)
  //     .children()
  //     .eq(2)
  //     .click();
  // });
  it("checks we can delete a card", () => {
    //deletes and asserts that the card with the edited text is gone

    //delete button click
    cy.get("div.some-unique-class")
      .children()
      .eq(1)
      .children()
      .eq(2)
      .children()
      .eq(1)
      .click();

    cy.get("div.some-unique-class")
      .children()
      .eq(1)
      .children()
      .should("have.length", 2);
  });

  it("adds a couple more cards and then hits clear button", () => {
    cy.get("input[name=textInput]").type(inputText);
    cy.get("button").contains("Add Card").click();
    cy.get("input[name=textInput]").type(inputText + "lksjdflkdjf");
    cy.get("button").contains("Add Card").click();
    cy.get("input[name=textInput]").type(inputText + "kdkdkdk");
    cy.get("button").contains("Add Card").click();
    cy.get("input[name=textInput]").type(inputText + "039490384");
    cy.get("button").contains("Add Card").click();
  });
  it("checks that the cards are gone after clear button click", () => {
    cy.get("button.is-info").contains("clear cards").click();
    cy.get("div.some-unique-class")
      .children()
      .eq(1)
      .children()
      .should("have.length", 1);
  });
});

describe("registers a new user that will crud the cards", () => {
  //sign in as new user
  //check that the cards are empty for a newly signed in user comes to home page
  it("clicks signup link ", () => {
    cy.get("a.link").contains("Signup").click();
  });
  it("types in username", () => {
    unique_username = `${REGISTER_USERNAME}-${Date.now()}`;
    cy.get("input[name=username]")
      .should("have.length", 1)
      .type(unique_username);
  });
  it("types in email", () => {
    unique_email = `${REGISTER_EMAIL}-${Date.now()}`;
    cy.get("input[name=email]").should("have.length", 1).type(unique_email);
  });
  it("types in password", () => {
    cy.get("input[name=password]")
      .should("have.length", 1)
      .type(REGISTER_PASSWORD);
  });
  it("clicks the submit button", () => {
    cy.get("button").contains("Sign Up!").should("have.length", 1).click();
  });
  it("checks that success message appears ", () => {
    cy.get("div.Vue-Toastification__toast-body").should("have.length", 1);
  });
  it("waits a bit and checks we are back at the home page, i.e. checking if the add card button is on the page, and that local storage has a token, and localstorage has a global email set DO ALL LOGGED IN CARDS FEATURES", () => {
    cy.wait(2000);
    cy.get("button").contains("Add Card");
    //not sure why the assertion only works here but okay
    // cypress trashes local storage during the test to prevent buildup of state or something like that
    cy.window().then((window: Cypress.AUTWindow) => {
      token = window.localStorage.getItem("id_token");
      const email = window.localStorage.getItem("global_email");
      expect(email).to.equal(unique_email);
      expect(token).to.not.be.null;
      cy.saveLocalStorage();
    });
  });
  it("creates DO ALL CRUD operations here since this is the only time the token will be available to make requests", () => {
    cy.restoreLocalStorage();
    cy.window().then((window: Cypress.AUTWindow) => {
      expect(window.localStorage.getItem("id_token")).to.equal(token);
    });
    cy.get("input[name=textInput]").type(inputText);
    cy.get("button").contains("Add Card").click();
    cy.wait(400);
    //wait a bit for it to appear in the DOM
    cy.get("div.some-unique-class")
      .children()
      .eq(1)
      .children()
      .eq(1)
      .children()
      .first()
      .contains(inputText);

    //edit standalone operations

    //click the edit card button on a card
    cy.get("div.some-unique-class")
      .children()
      .eq(1)
      .children()
      .eq(1)
      .children()
      .eq(2)
      .contains("Edit Card")
      .click();

    cy.get("input[name=modalEdit]").type(editText);
    cy.get("button").contains("SUBMIT EDIT").click();
    //check it contains the text we just edited
    cy.get("div.some-unique-class")
      .children()
      .eq(1)
      .children()
      .eq(1)
      .children()
      .first()
      .contains(editText);

    //   //delete button click
    cy.get("div.some-unique-class")
      .children()
      .eq(1)
      .children()
      .eq(1)
      .children()
      .eq(1)
      .contains("delete card")
      .click();
    //checks it was deleted
    cy.get("div.some-unique-class")
      .children()
      .eq(1)
      .children()
      .should("have.length", 1);

    //clear standalone operations
    cy.get("button.is-info").contains("clear cards").click();
    cy.get("div.some-unique-class")
      .children()
      .eq(1)
      .children()
      .should("have.length", 1);
  });
});

//   // check error if creates with expired token
// this error will happen if i try to add in a new it block cypress will trash local storage

// describe("checks local storage", () => {
//   it("checks window local storage here ", () => {
//     cy.restoreLocalStorage();
//     cy.window().then((window: Cypress.AUTWindow) => {
//       expect(window.localStorage.getItem("id_token")).to.equal(token);
//     });
//   });
// });

describe("logs out", () => {
  it("clicks logout", () => {
    cy.get("span.link").contains("Logout").click();
  });
});
