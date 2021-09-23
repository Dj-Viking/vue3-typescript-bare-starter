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
  // NOT_MY_EMAIL,
  // NOT_FOUND_EMAIL 
} = process.env; 

const logger = ColorLog;
let newToken: string = "";
let creatorId: number = 0;
let creatorEmail: string = "";
let newTodoId: number | undefined = 0;
let newUserId: number = 0;

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
    newUserId = creatorId;

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
  

  it("tries to add a todo with a invalid token", async () => {
    //user not authenticated (bad token or no token)
    const invalidToken: AddTodoResponse = await request(
      HOST + "/graphql",
      `${createAddTodoMutation("hello from test")}`,
      {},
      { "authorization": `Bearer adsfadfs` }
    );
    expect(invalidToken.addTodo.errors).toHaveLength(1);
    expect(invalidToken.addTodo.errors[0].message).toBe("401 user not authenticated");
  });

  it("tries to add a todo with an expired token", async () => {
    //user not authenticated (bad token or no token)
    const invalidToken: AddTodoResponse = await request(
      HOST + "/graphql",
      `${createAddTodoMutation("hello from test")}`,
      {},
      { "authorization": `Bearer ${EXPIRED_TOKEN}` }
    );
    expect(invalidToken.addTodo.errors).toHaveLength(1);
    expect(invalidToken.addTodo.errors[0].message).toBe("401 user not authenticated");
  });

  it("should successfully add a todo with the proper credentials", async () => {
    //this should all be good, user is authenticated and 
    // the requestor's id is the id of the original todoList creator
    const res: AddTodoResponse = await request(
      HOST + "/graphql", 
      `${createAddTodoMutation("hello from test")}`, 
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
    
    
});

describe("checks the getting todos mutation responses", () => {

  it("checks that the todo is added to the DB by the creatorId that made the todo", async () => {
    //make query for get todo by id
    new logger("purple", "getting the todo we just made from the id generated from the add todo response").genLog();
    // TODO add auth only requestor can get their todos
    const res: GetUserTodosResponse = await request(
      HOST + "/graphql", `${createGetUserTodosQuery()}`,
      {},
      { "authorization": `Bearer ${newToken}` }
    );
    const foundCreatorTodo = res.getUserTodos.todos?.filter(todo => todo.creatorId === newUserId)[0];

    expect(res.getUserTodos.todos).toHaveLength(1);
    expect(foundCreatorTodo?.creatorId).toEqual(newUserId);
    expect(res.getUserTodos.errors).toBeNull();
    expect(res.getUserTodos.todos?.length).toBeTruthy();
    
  });
  
  it("checks the error messages are correct when not authenticated (not valid token)", async () => {
    new logger("purple", "checking for getting todos with invalid token");
    //check that the response
    const notFound: GetUserTodosResponse = await request(
      HOST + "/graphql",
      `${createGetUserTodosQuery()}`,
      {}, 
      { "authorization": `Bearer sdf` }
    );
    
    expect(notFound.getUserTodos.errors).toHaveLength(1);
    expect(notFound.getUserTodos.errors[0].message).toBe("401 Unauthenticated");
  });
  
  it("tries to get user todos with invalid token", async () => {
    //check that the response
    const invalidToken: GetUserTodosResponse = await request(
      HOST + "/graphql",
      `${createGetUserTodosQuery()}`,
      {}, 
      { "authorization": `Bearer asdfasdf` }
    );
    
    expect(invalidToken.getUserTodos.errors).toHaveLength(1);
    expect(invalidToken.getUserTodos.errors[0].message).toBe("401 Unauthenticated");
  });
  it("tries to get user todos with expired token", async () => {
    //check that the response
    const expired: GetUserTodosResponse = await request(
      HOST + "/graphql",
      `${createGetUserTodosQuery()}`,
      {}, 
      { "authorization": `Bearer ${EXPIRED_TOKEN}` }
    );
    
    expect(expired.getUserTodos.errors).toHaveLength(1);
    expect(expired.getUserTodos.errors[0].message).toBe("401 Unauthenticated");
  });
});


describe("checks editing a todo", () => {
  describe("checks edit todo access control logic", () => {
    it("tries to edit the todo with an invalid token", async () => {
      const editTodoPayload = {
        text: UPDATED_TODO_TEXT,
        todoId: newTodoId
      }
      const invalidToken: EditTodoByIdResponse = await request(
        HOST + "/graphql", 
        `${createEditTodoMutation(editTodoPayload)}`,
        {},
        { "authorization": `Bearer asdfasdfasdf`}
      );
      expect(invalidToken.editTodoById.errors).toHaveLength(1);
      expect(invalidToken.editTodoById.errors[0].message).toBe("401 Unauthenticated");
    });
    it("tries to edit the todo with an expired token", async () => {
      const editTodoPayload = {
        text: UPDATED_TODO_TEXT,
        email: creatorEmail,
        todoId: newTodoId
      }
      const expiredToken: EditTodoByIdResponse = await request(
        HOST + "/graphql", 
        `${createEditTodoMutation(editTodoPayload)}`,
        {},
        { "authorization": `Bearer ${EXPIRED_TOKEN}`}
      );
      expect(expiredToken.editTodoById.errors).toHaveLength(1);
      expect(expiredToken.editTodoById.errors[0].message).toBe("401 Unauthenticated");
    });
    it("tries to edit the todo with a not found todoId", async () => {
      const editTodoPayload = {
        text: UPDATED_TODO_TEXT,
        email: creatorEmail,
        todoId: 0
      }
      const notFound: EditTodoByIdResponse = await request(
        HOST + "/graphql", 
        `${createEditTodoMutation(editTodoPayload)}`,
        {},
        { "authorization": `Bearer ${newToken}`}
      );
      expect(notFound.editTodoById.errors).toHaveLength(1);
      expect(notFound.editTodoById.errors[0].message).toBe("404 Todo Not Found");
      
    });
  });
  
  it("edits the todo that was just added", async () => {
    new logger("blue", "editing the todo we just added").genLog();
    const editTodoPayload = {
      text: UPDATED_TODO_TEXT,
      todoId: newTodoId
    }
    const res: EditTodoByIdResponse = await request(
      HOST + "/graphql", 
      `${createEditTodoMutation(editTodoPayload)}`,
      {},
      { "authorization": `Bearer ${newToken}`}
    );
    logJson(res.editTodoById.todo);
    expect(res.editTodoById.todo?.text).toEqual(UPDATED_TODO_TEXT);
  });
});

describe("deletes the todos", () => {

  it("tries to delete todos with an invalid token", async () => {
    new logger("purple", "deleting the user's todos that we made").genLog();  
    //malformed token test error
    const invalidToken: ClearUserTodosResponse = await request(
      HOST + "/graphql", 
      `${createClearUserTodosMutation()}`, 
      {},
      { "authorization": `Bearer al;kdjf;asfj` }
    );
    new logger("red", "should get expired error or unauthed because of a mangled, missing, or invalid token").genLog();
    expect(invalidToken.clearUserTodos.errors).toHaveLength(1);
    expect(invalidToken.clearUserTodos.errors[0].message).toBe("401 unauthorized or expired token");

  });

  it("tries to clear todos with an expired token", async () => {
    //expired token test error
    const expiredToken: ClearUserTodosResponse = await request(
      HOST + "/graphql", 
      `${createClearUserTodosMutation()}`, 
      {},
      { "authorization": `Bearer ${EXPIRED_TOKEN}` }
    );
  
    new logger("red", "should get expired error or unauthed").genLog();
    expect(expiredToken.clearUserTodos.errors).toHaveLength(1);
    expect(expiredToken.clearUserTodos.errors[0].message).toBe("401 unauthorized or expired token");
  });
  
  it("should successfully clear todos", async () => {
    //delete the currently registered user's todos
    const successClear: ClearUserTodosResponse = await request(
      HOST + "/graphql", 
      `${createClearUserTodosMutation()}`,
      {},
      { "authorization": `Bearer ${newToken}` }
    );
    expect(successClear.clearUserTodos.errors).toBeNull();
    expect(successClear.clearUserTodos.done).toBe(true);
  });
});

describe("deletes the todos we just made and then deletes the user", () => {
  it("checks the user's todos to see if the deleted todo is now missing", async () => {
    new logger("purple", "checking if the user's todos are gone").genLog();
    const res: GetUserTodosResponse = await request(
      HOST + "/graphql", 
      `${createGetUserTodosQuery()}`,
      {},
      { "authorization": `Bearer ${newToken}` }
    );
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
