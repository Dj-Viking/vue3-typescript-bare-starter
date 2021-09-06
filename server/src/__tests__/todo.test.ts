import { request } from "graphql-request";
import { User } from "../entities/User";
import { 
  HOST, 
} from "../constants";
import { connectDb } from "./utils/connectDb";
import {
  REGISTER_MUTATION, 
  REGISTER_EMAIL,
  UPDATED_TODO_TEXT
} from "../constants";
import { ANSI_ESCAPES, RegisterResponse, AddTodoResponse, GetUserTodosResponse, ClearUserTodosResponse, EditTodoByIdResponse } from "../types";
import { createAddTodoMutation, createClearUserTodosMutation, createEditTodoMutation, createGetUserTodosQuery, logJson } from "./utils/helpers";

let creatorId: number = 0;
let newTodoId: number = 0;

describe("Tests the user register", () => {
  it("get expected response from the register mutation", async () => {

    console.log(`${ANSI_ESCAPES.blue}`, `Registering a new user`, `${ANSI_ESCAPES.reset}`);
    const res: RegisterResponse = await request(HOST + "/graphql", REGISTER_MUTATION);
    logJson(res);
    console.log('user', res);

    //assign the creatorId for later when we add a todo
    creatorId = res.register.user.id;
    
    expect(res.register.token).toBeTruthy();
    expect(res.register.errors).toBeNull();
    expect(res.register.user.email).toEqual(REGISTER_EMAIL);
  });
  
  it("and check that the user got added to the db", async () => {
    console.log(`${ANSI_ESCAPES.blue}`, `checking that the user got added to the DB`, `${ANSI_ESCAPES.reset}`);
    const connection = await connectDb();
    const users = await User.find({ where: { email: REGISTER_EMAIL }});
    logJson(users);
    expect(users).toHaveLength(1);
    connection.close();
  });

  it("checks if we try to register with the same credentials it returns an error", async () => {
    console.log(`${ANSI_ESCAPES.blue}`, `trying to register the same user`, `${ANSI_ESCAPES.reset}`);
    const res: RegisterResponse = await request(HOST + "/graphql", REGISTER_MUTATION);
    logJson(res);
    expect(res.register.errors).toHaveLength(1);
  });
});

describe("Tests the todo resolvers adding, reading, editing, and deleting", () => {
  it("adds a todo from the user's stored ID from when we created them earlier", async () => {
    console.log(`${ANSI_ESCAPES.blue}`, `starting process of adding a todo with the creatorId`, `${ANSI_ESCAPES.reset}`);
    const res: AddTodoResponse = await request(HOST + "/graphql", `${createAddTodoMutation(creatorId)}`);
    logJson(res.addTodo);

    
    //find the todos that have the creator's id
    const foundTodo = res.addTodo.filter(todo => todo.creatorId === creatorId)[0];

    newTodoId = foundTodo.id;
    expect(foundTodo.creatorId).toEqual(creatorId);
  });

  it("checks that the todo is added to the DB by the creatorId that made the todo", async () => {
    //make query for get todo by id
    console.log(`${ANSI_ESCAPES.blue}`, `getting the todo we just made from the id generated from the add todo response`, `${ANSI_ESCAPES.reset}`);
    const res: GetUserTodosResponse = await request(HOST + "/graphql", `${createGetUserTodosQuery(creatorId)}`);
    
    expect(res.getUserTodos).toHaveLength(1);
  });

  it("edits the todo that was just added", async () => {
    console.log(`${ANSI_ESCAPES.blue}`, `editing the todo we just added`, `${ANSI_ESCAPES.reset}`);
    const editTodoPayload = {
      text: UPDATED_TODO_TEXT,
      id: newTodoId
    }
    const res: EditTodoByIdResponse = await request(HOST + "/graphql", `${createEditTodoMutation(editTodoPayload)}`);
    logJson(res.editTodoById.todo);
    expect(res.editTodoById.todo?.text).toEqual(UPDATED_TODO_TEXT);
  });

  it("deletes the todos that the user just made", async () => {
    console.log(`${ANSI_ESCAPES.blue}`, `deleting the user's todos that we made`, `${ANSI_ESCAPES.reset}`);
    const res: ClearUserTodosResponse = await request(HOST + "/graphql", `${createClearUserTodosMutation(creatorId)}`);

    expect(res.clearUserTodos).toBe(true);
  });

  it("checks the user's todos to see if the deleted todo is now missing", async () => {
    console.log(`${ANSI_ESCAPES.blue}`, `checking if the user's todos are gone`, `${ANSI_ESCAPES.reset}`);
    const res: GetUserTodosResponse = await request(HOST + "/graphql", `${createGetUserTodosQuery(creatorId)}`);
    expect(res.getUserTodos.length).toEqual(0);
  });

  it("deletes the user", async () => {
    const connection = await connectDb();
    await User.delete({ email: REGISTER_EMAIL });
    const users = await User.find({ where: { email: REGISTER_EMAIL } });
    console.log(`${ANSI_ESCAPES.blue}`, `deleting a user ${users}`, `${ANSI_ESCAPES.reset}`);
    logJson(users);
    expect(users).toHaveLength(0);
    connection.close();
  });

});
