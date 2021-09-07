import { request } from "graphql-request";
import { User } from "../entities/User";
import { connectDb } from "./utils/connectDb";
import {
  REGISTER_MUTATION,
  REGISTER_EMAIL,
  UPDATED_TODO_TEXT,
  HOST
} from "../constants";
import { RegisterResponse, AddTodoResponse, GetUserTodosResponse, ClearUserTodosResponse, EditTodoByIdResponse } from "../types";
import { createAddTodoMutation, createClearUserTodosMutation, createEditTodoMutation, createGetUserTodosQuery, ColorLog, logJson } from "./utils/helpers";


const logger = ColorLog;
let token: string = "";
let creatorId: number = 0;
let newTodoId: number | undefined = 0;

describe("Tests the user register", () => {
  it("get expected response from the register mutation", async () => {
    new logger("purple", "Registering a new user with new logger class").genLog();
    const res: RegisterResponse = await request(HOST + "/graphql", REGISTER_MUTATION);
    logJson(res);
    console.log('user', res);

    //assign the creatorId for later when we add a todo
    creatorId = res.register.user.id;

    token = res.register.token;

    expect(res.register.token).toBeTruthy();
    expect(res.register.errors).toBeNull();
    expect(res.register.user.email).toEqual(REGISTER_EMAIL);
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
  it("adds a todo from the user's stored ID from when we created them earlier", async () => {
    new logger("purple", "starting the process of adding a todo with the creatorId").genLog();
    const res: AddTodoResponse = await request(HOST + "/graphql", `${createAddTodoMutation(creatorId)}`, {},  
      {
        "authorization":  `Bearer ${token}`
      }
    );
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
    const res: GetUserTodosResponse = await request(HOST + "/graphql", `${createGetUserTodosQuery(creatorId)}`);

    expect(res.getUserTodos.todos?.length).toBeTruthy();
    expect(res.getUserTodos.todos).toHaveLength(1);
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

  it("deletes the todos that the user just made", async () => {
    new logger("purple", "deleting the user's todos that we made").genLog();
    const res: ClearUserTodosResponse = await request(HOST + "/graphql", `${createClearUserTodosMutation(creatorId)}`);
    expect(res.clearUserTodos.done).toBe(true);
  });

  it("checks the user's todos to see if the deleted todo is now missing", async () => {
    new logger("purple", "checking if the user's todos are gone").genLog();
    const res: GetUserTodosResponse = await request(HOST + "/graphql", `${createGetUserTodosQuery(creatorId)}`);
    expect(res.getUserTodos.todos?.length).toEqual(0);
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