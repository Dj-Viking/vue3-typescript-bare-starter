import {
  LOCALHOST_URL,
  EMAIL,
  USERNAME,
  REGISTER_PASSWORD,
  REGISTER_EMAIL,
  REGISTER_USERNAME,
} from "tests/constants";

let unique_username = "";
let unique_email = "";

describe("signup-unit-test, tests signup functionality", () => {
  it("visits the site signup page", () => {
    cy.visit(LOCALHOST_URL);
  });
  it("clicks signup router link to navigate to the signup page", () => {
    cy.get("a.link").contains("Signup").should("have.length", 1).click();
  });
});

describe("tests signup with invalid email, has error message", () => {
  //clear inputs after this is done so the next test can run just fine
  it("types in some username", () => {
    cy.get("input[name=username]").should("have.length", 1).type("sldkjfkdjfd");
  });
  it("types in incorrect email", () => {
    cy.get("input[name=email]").should("have.length", 1).type("ksdkjfkdjfd");
  });
  it("types in incorrect password", () => {
    cy.get("input[name=password]").should("have.length", 1).type("dsafsdf");
  });
  it("clicks submit button", () => {
    cy.get("button").contains("Sign Up!").should("have.length", 1).click();
  });
  it("checks that error message appears", () => {
    cy.get("p.has-text-danger")
      .contains(
        "Error: Email is not in correct format. Must be like example@mail.com"
      )
      .should("have.length", 1);
  });
  it("clears the inputs", () => {
    cy.get("input[name=username]").clear();
    cy.get("input[name=email]").clear();
    cy.get("input[name=password]").clear();
    cy.wait(1000);
  });
});
//Error: password length too short must be greater than 3 characters
describe("tries to make account with too short password", () => {
  it("types in some username", () => {
    cy.get("input[name=username]").should("have.length", 1).type("sldkjfkdjfd");
  });
  it("types in incorrect email", () => {
    cy.get("input[name=email]").should("have.length", 1).type("asdf@asdf.com");
  });
  it("types password that is too short", () => {
    cy.get("input[name=password]").should("have.length", 1).type("sdf");
  });
  it("clicks submit button", () => {
    cy.get("button").contains("Sign Up!").should("have.length", 1).click();
  });
  it("checks that error message appears", () => {
    cy.get("p.has-text-danger")
      .contains(
        "Error: password length too short must be greater than 3 characters"
      )
      .should("have.length", 1);
  });
  it("clears the inputs", () => {
    cy.get("input[name=username]").clear();
    cy.get("input[name=email]").clear();
    cy.get("input[name=password]").clear();
    cy.wait(1000);
  });
});

describe("checks the user or email error appears", () => {
  it("types in an already used email", () => {
    cy.get("input[name=email]").type(EMAIL);
  });
  it("types in an already used username", () => {
    cy.get("input[name=username]").type(USERNAME);
  });
  it("types in some password", () => {
    cy.get("input[name=password]").type(Date.now().toString());
  });
  it("clicks sign up button", () => {
    cy.get("button").contains("Sign Up!").click();
  });
  it("checks that error message appears", () => {
    cy.get("p.has-text-danger")
      .contains("Error: name and/or email is already taken!")
      .should("have.length", 1);
  });
  it("clears the inputs", () => {
    cy.get("input[name=username]").clear();
    cy.get("input[name=email]").clear();
    cy.get("input[name=password]").clear();
    cy.wait(1000);
  });
});

describe("tests the register with valid inputs works, has success message, and navigates back to home page", () => {
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
    cy.get("p.has-text-success")
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
      expect(email).to.equal(unique_email);
      expect(token).to.not.be.null;
    });
  });
});

describe("should be able to login with those credentials that we just registered with", () => {
  it("goes to login page", () => {
    cy.visit(LOCALHOST_URL + "login");
  });
  it("types in email", () => {
    cy.get("input[name=email]").should("have.length", 1).type(unique_email);
  });
  it("types in password", () => {
    cy.get("input[name=password]")
      .should("have.length", 1)
      .type(REGISTER_PASSWORD);
  });
  it("clicks the submit button", () => {
    cy.get("button").contains("Login").should("have.length", 1).click();
  });
  it("checks that success message appears ", () => {
    cy.wait(100);
    cy.get("p.has-text-success")
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
      expect(email).to.equal(unique_email);
      expect(token).to.not.be.null;
    });
  });

  it("logs out", () => {
    cy.wait(1000);
    cy.get("span.link").contains("Logout").click();
  });
});
