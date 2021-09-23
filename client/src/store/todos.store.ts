import {
  MyRootState,
  TodosState,
  UserState,
  Todo,
  RootCommitType,
} from "@/types";
import { ActionContext } from "vuex";

const state: TodosState = {
  todos: new Array(2).fill(undefined).map((_, index: number) => {
    return {
      id: Date.now(),
      text: "something is here " + index,
      color: "blue",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }),
};
const mutations = {
  SET_TODOS(state: TodosState, payload: Todo[]): void {
    if (typeof payload !== "object" || payload === null)
      return console.error(
        "payload must be a specific type of object but it was ",
        payload
      );
    state.todos = payload;
  },
  ADD_TODO(state: TodosState, payload: Todo): void {
    if (typeof payload !== "object" || payload === null)
      return console.error(
        "payload must be a specific type of object but it was ",
        payload
      );
    state.todos.unshift(payload);
  },
  DELETE_TODO(state: TodosState, id: number): void {
    if (typeof id !== "number" || id === null)
      return console.error("index argument must be a number but it was: ", id);

    //return a filtered array that doesn't have the id passed as an argument
    state.todos = state.todos.filter((todo) => todo.id !== id);
  },
  EDIT_TODO(state: TodosState, payload: { id: number; text: string }): void {
    const { id, text } = payload;
    //cant check if the index is !zero and return because 0 is a falsey value in javascript. even though
    // arrays are zero indexed haha

    if (!id || !text)
      return console.error(
        "error in edit todo commit payload types are incorrect"
      );
    const index = state.todos.findIndex((todo) => todo.id === id);
    state.todos[index].text = text;
    state.todos[index].updatedAt = Date.now();
  },
};
const actions = {
  async addTodo(
    { commit }: ActionContext<UserState, MyRootState>,
    payload: Todo
  ): Promise<void | boolean> {
    if (typeof payload !== "object" || payload === null)
      return console.error(
        "payload must be a specific type of object but it was ",
        payload
      );
    try {
      commit("todos/ADD_TODO" as RootCommitType, payload, { root: true });
      return Promise.resolve(true);
    } catch (error) {
      console.error(error);
      return Promise.resolve(false);
    }
  },
  async setTodos(
    { commit }: ActionContext<TodosState, MyRootState>,
    payload: TodosState
  ): Promise<void | boolean> {
    try {
      commit("todos/SET_TODOS" as RootCommitType, payload, { root: true });
      return Promise.resolve(true);
    } catch (error) {
      console.error(error);
      return Promise.resolve(false);
    }
  },
  async deleteTodo(
    { commit }: ActionContext<TodosState, MyRootState>,
    index: number
  ): Promise<void | boolean> {
    try {
      commit("todos/DELETE_TODO" as RootCommitType, index, { root: true });
      return Promise.resolve(true);
    } catch (error) {
      console.error(error);
      return Promise.resolve(false);
    }
  },
  async editTodo(
    { commit }: ActionContext<TodosState, MyRootState>,
    payload: { index: number; text: string }
  ): Promise<void | boolean> {
    try {
      commit("todos/EDIT_TODO" as RootCommitType, payload, { root: true });
      return Promise.resolve(true);
    } catch (error) {
      console.error(error);
      return Promise.resolve(false);
    }
  },
};
const getters = {
  todos(state: TodosState): Todo[] | [] {
    return state.todos || [];
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
