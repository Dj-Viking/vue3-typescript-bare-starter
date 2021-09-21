import {
  MyRootState,
  TodosState,
  UserState,
  Todo,
  RootDispatchType,
  RootCommitType,
} from "@/types";
import { ActionContext } from "vuex";

const state: UserState = {
  user: {
    username: "",
    email: "",
    token: "",
    todos: [] as Todo[],
    loggedIn: false,
  },
};
const mutations = {
  SET_USER(state: UserState, payload: UserState): void {
    console.log("some payload", payload);

    if (typeof payload !== "object")
      return console.error("payload was was not an object!");
    state.user = {
      ...state.user,
      ...payload,
    } as UserState["user"];
    delete state.user.token;
  },
  SET_LOGGED_IN(state: UserState, payload: boolean): void {
    console.log("setting logged in", payload);
    state.user = {
      ...state.user,
      loggedIn: payload,
    };
  },
  // eslint-disable-next-line
  // CLEAR_USER_TOKEN(state: UserState, payload: null): void {
  //   // eslint-disable-next-line
  //   //@ts-ignore
  //   state.user = {
  //     ...state.user,
  //     token: payload,
  //   };
  // },
  // eslint-disable-next-line
  CLEAR_USER(state: UserState, payload: any): void {
    state.user = payload;
  },
};
const actions = {
  async setUser(
    { commit }: ActionContext<UserState, MyRootState>,
    payload: UserState
  ): Promise<void> {
    commit("user/SET_USER" as RootCommitType, payload, { root: true });
  },
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
