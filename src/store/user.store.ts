import {
  MyRootState,
  TodosState,
  UserState,
  Todo,
  RootDispatchType,
} from "@/types";
import { ActionContext } from "vuex";

const state: UserState = {
  user: {
    username: "",
    email: "",
    token: "",
    todos: [] as Todo[],
  },
};
const mutations = {
  SET_USER(state: UserState, payload: UserState): void {
    if (typeof payload !== "object")
      return console.error("payload was was not an object!");
    state = {
      ...state,
      ...payload,
    };
  },
  CLEAR_USER_TOKEN(state: UserState, payload: null): void {
    state.user.token = payload;
  },
};
const actions = {
  async getUserTodos(
    { dispatch }: ActionContext<UserState, MyRootState>,
    payload: TodosState
  ): Promise<void> {
    //some db call to get logged in user's account todos

    //get the todos then set them on the todos state of the users login page

    //type casting here provides the autocomplete for string union type of
    // all possible rootstate actions accessed with the root: true option as 3rd argument
    await dispatch("user/setUserTodos" as RootDispatchType, payload, {
      root: true,
    });

    //set the todos on the page
    await dispatch("todos/setTodos" as RootDispatchType, payload, {
      root: true,
    });
  },
  // async saveUserTodos(){}
};
const getters = {};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
