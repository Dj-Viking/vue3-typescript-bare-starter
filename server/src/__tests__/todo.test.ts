require("dotenv").config();
import { request } from "graphql-request";
import { User } from "../entities/User";
import { connectDb } from "./utils/connectDb";
import {
  REGISTER_MUTATION,
  REGISTER_EMAIL,
  UPDATED_TODO_TEXT,
  HOST,
} from "../constants";
import { RegisterResponse, AddTodoResponse, GetUserTodosResponse, ClearUserTodosResponse, EditTodoByIdResponse } from "../types";
import { createAddTodoMutation, createClearUserTodosMutation, createEditTodoMutation, createGetUserTodosQuery, ColorLog, logJson } from "./utils/helpers";

const { 
  EXPIRED_TOKEN, 
  NOT_MY_EMAIL,
  NOT_FOUND_EMAIL 
} = process.env; 

const logger = ColorLog;
let newToken: string = "";
let creatorId: number = 0;
let creatorEmail: string = "";
let newTodoId: number | undefined = 0;

describe("Tests the user register", () => {
  it("get expected response from the register mutation", async () => {
    new logger("purple", "Registering a new user with new logger class").genLog();
    const res: RegisterResponse = await request(HOST + "/graphql", REGISTER_MUTATION);
    logJson(res);
    console.log('user', res);

    expect(res.register.errors).toBeNull();

    //assign the creatorId for later when we add a todo
    expect(typeof res.register.user.id).toBe("number");
    creatorId = res.register.user.id;

    expect(res.register.token).toBeTruthy();
    newToken = res.register.token;

    expect(res.register.user.email).toEqual(REGISTER_EMAIL);
    creatorEmail = res.register.user.email;
  });

  it("and check that the user got added to the db", async () => {
    new logger("purple", "checking that the user got added to the DB").genLog();
    const connection = await connectDb();
    const users = await User.find({ where: { email: REGISTER_EMAIL } });
    logJson(users);
    expect(users).toHaveLength(1);
    connection.close();
  });

  it("checks if we try to register with the same credentials it returns an error", async () => {
    new logger("purple", "trying to register the same user").genLog();
    const res: RegisterResponse = await request(HOST + "/graphql", REGISTER_MUTATION);
    logJson(res);
    expect(res.register.errors).toHaveLength(1);
  });
});

describe("Tests the todo resolvers adding, reading, editing, and deleting", () => {
  it("adds a todo from the user's stored ID from when we created them earlier and checks if the user is authenticated to do so and has a fresh token to do so", async () => {
    new logger("purple", "starting the process of adding a todo with the creatorId").genLog();

    //user with that email not found
    const notFound: AddTodoResponse = await request(
      HOST + "/graphql",
      `${createAddTodoMutation(NOT_FOUND_EMAIL as string)}`,
      {},
      { "authorization": `Bearer ${newToken}` }
    );
    expect(notFound.addTodo.errors).toHaveLength(1);
    expect(notFound.addTodo.errors[0].message).toBe("404 Not Found");
    
    //user not authenticated (bad token or no token)
    const unauthed: AddTodoResponse = await request(
      HOST + "/graphql",
      `${createAddTodoMutation(creatorEmail)}`,
      {},
      { "authorization": `Bearer adsfadfs` }
    );
    expect(unauthed.addTodo.errors).toHaveLength(1);
    expect(unauthed.addTodo.errors[0].message).toBe("401 user not authenticated");
    
    //user cant add todos to someone elses todo list (forbidden)
    const forbidden: AddTodoResponse = await request(
      HOST + "/graphql",
      `${createAddTodoMutation(NOT_MY_EMAIL as string)}`,
      {},
      { "authorization": `Bearer ${newToken}` }
    );
    expect(forbidden.addTodo.errors).toHaveLength(1);
    expect(forbidden.addTodo.errors[0].message).toBe("403 Forbidden");
    
    //this should all be good, user is authenticated and 
    // the requestor's id is the id of the original todoList creator
    const res: AddTodoResponse = await request(
      HOST + "/graphql", 
      `${createAddTodoMutation(creatorEmail)}`, 
      {},
      { "authorization":  `Bearer ${newToken}`}
    );

    expect(res.addTodo.errors).toBeNull();
    logJson(res.addTodo);
    //find the todos that have the creator's id
    const foundTodo = res.addTodo.todos?.filter(todo => todo.creatorId === creatorId)[0];

    expect(typeof foundTodo?.id).toBe("number");
    expect(typeof foundTodo?.creatorId).toBe("number");
    newTodoId = foundTodo?.id;
    expect(foundTodo?.creatorId).toEqual(creatorId);
  });

  it("checks that the todo is added to the DB by the creatorId that made the todo", async () => {
    //make query for get todo by id
    new logger("purple", "getting the todo we just made from the id generated from the add todo response").genLog();
    // TODO add auth only requestor can get their todos
    const res: GetUserTodosResponse = await request(HOST + "/graphql", `${createGetUserTodosQuery(creatorEmail)}`, {}, {
      "authorization": `Bearer ${newToken}`
    });
    expect(res.getUserTodos.errors).toBeNull();
    expect(res.getUserTodos.todos?.length).toBeTruthy();
    expect(res.getUserTodos.todos).toHaveLength(1);
  });

  it("checks the error messages are correct when not authenticated (no token), email input is not a user that is found, requestor's email is not the same as the email input", async () => {
    new logger("purple", "checking the error messages that throw on the request are for the proper situation");
    //check that the response
    const notFound: GetUserTodosResponse = await request(
      HOST + "/graphql",
      `${createGetUserTodosQuery(NOT_FOUND_EMAIL as string)}`,
      {}, 
      { "authorization": `Bearer ${newToken}` }
    );
    
    //expect the error length to be a number and not undefined
    // expect(notFound.getUserTodos.errors).toBeNull();
    expect(typeof notFound.getUserTodos.errors.length).toBe("number");
    expect(notFound.getUserTodos.errors[0].message).toBe("404 Not Found");
  });


  it("edits the todo that was just added", async () => {
    new logger("blue", "editing the todo we just added").genLog();
    const editTodoPayload = {
      text: UPDATED_TODO_TEXT,
      id: newTodoId
    }
    const res: EditTodoByIdResponse = await request(HOST + "/graphql", `${createEditTodoMutation(editTodoPayload)}`);
    logJson(res.editTodoById.todo);
    expect(res.editTodoById.todo?.text).toEqual(UPDATED_TODO_TEXT);
  });

  it("deletes the todos that the user just made checking if we are authenticated to do so and that the requestor token is not expired", async () => {
    new logger("purple", "deleting the user's todos that we made").genLog();
    // TODO write tests to verify the access control in the resolver is working for this mutation

    //malformed token test error
    const res1: ClearUserTodosResponse = await request(HOST + "/graphql", `${createClearUserTodosMutation(creatorEmail)}`, {}, {
      "authorization": `Bearer al;kdjf;asfj`
    });

    if (res1.clearUserTodos.errors !== null) {
      new logger("red", `should get unauthorized error or expired error:  ${res1.clearUserTodos.errors[0].message}`).genLog();
      expect(res1.clearUserTodos.errors[0].message).toBe("401 unauthorized or expired token");
      //ERRORS not null there is an error message
      new logger("red", `${res1.clearUserTodos.errors[0].message }`);
    } else if (res1.clearUserTodos.errors === null){
      //errors was null no error message
      new logger("green", `clear todos action was done should be true: ${res1.clearUserTodos.done}`);
    }
    
    new logger("green", `clear todos action was done should be true: ${res1.clearUserTodos.done}`);
    //expired token test error
    const res3: ClearUserTodosResponse = await request(HOST + "/graphql", `${createClearUserTodosMutation(creatorEmail)}`, {}, {
      "authorization": `Bearer ${EXPIRED_TOKEN}`
    });

    new logger("red", "should get expired error").genLog();
    if (res3.clearUserTodos.errors !== null) {
      expect(res3.clearUserTodos.errors[0].message).toBeTruthy();
      // expect(res3.clearUserTodos.errors[0].message).toBe("unauthorized");
      //ERRORS not null there is an error message
      new logger("red", `${res3.clearUserTodos.errors[0].message }`);
    } else if (res3.clearUserTodos.errors === null) {
      //errors was null no error message
      new logger("green", `clear todos action was done should be true: ${res3.clearUserTodos.done}`);
    }
    expect(res3.clearUserTodos.errors).toHaveLength(1);
    expect(res3.clearUserTodos.errors[0].message).toBe("401 unauthorized or expired token");

    //delete the currently registered user's todos
    const res2: ClearUserTodosResponse = await request(HOST + "/graphql", `${createClearUserTodosMutation(creatorEmail)}`, {}, {
      "authorization": `Bearer ${newToken}`
    });

    expect(res2.clearUserTodos.done).toBe(true);
  });

  it("checks the user's todos to see if the deleted todo is now missing", async () => {
    new logger("purple", "checking if the user's todos are gone").genLog();
    const res: GetUserTodosResponse = await request(HOST + "/graphql", `${createGetUserTodosQuery(creatorEmail)}`, {}, {
      "authorization": `Bearer ${newToken}`
    });
    expect(res.getUserTodos.errors).toBeNull();

    //if this fails then something failed before we got here because we couldn't clear the todos before arriving here
    expect(res.getUserTodos.todos).toHaveLength(0);
  });

  it("deletes the user", async () => {
    const connection = await connectDb();
    await User.delete({ email: REGISTER_EMAIL });
    const users = await User.find({ where: { email: REGISTER_EMAIL } });
    new logger("green", `deleting a user ${users}`).genLog();
    logJson(users);
    expect(users).toHaveLength(0);
    connection.close();
  });
  
});
