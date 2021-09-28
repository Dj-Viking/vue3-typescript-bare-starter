import {
  MyRootState,
  CardsState,
  UserState,
  Card,
  RootCommitType,
} from "@/types";
import { ActionContext } from "vuex";

const state: CardsState = {
  cards: new Array(2).fill(undefined).map((_, index: number) => {
    return {
      id: Date.now() + index, //ids must be unique
      text: "something is here " + index,
      color: "blue",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }),
};
const mutations = {
  SET_CARDS(state: CardsState, payload: Card[]): void {
    if (typeof payload !== "object" || payload === null)
      return console.error(
        "payload must be a specific type of object but it was ",
        payload
      );
    state.cards = payload;
  },
  ADD_CARD(state: CardsState, payload: Card): void {
    if (typeof payload !== "object" || payload === null)
      return console.error(
        "payload must be a specific type of object but it was ",
        payload
      );
    state.cards.unshift(payload);
  },
  DELETE_CARD(state: CardsState, id: number): void {
    if (typeof id !== "number" || id === null)
      return console.error("index argument must be a number but it was: ", id);

    //return a filtered array that doesn't have the id passed as an argument
    state.cards = state.cards.filter((todo) => todo.id !== id);
  },
  //only for local state
  EDIT_CARD(state: CardsState, payload: { id: number; text: string }): void {
    const { id, text } = payload;
    if (!id || !text)
      return console.error(
        "error in edit card commit payload types are incorrect"
      );
    //this only works for local state not during a graphql mutation i think
    const index = state.cards.findIndex((card) => card.id === id);
    state.cards[index].text = text;
    state.cards[index].updatedAt = Date.now();
  },
};
const actions = {
  async addCard(
    { commit }: ActionContext<UserState, MyRootState>,
    payload: Card
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
  async setCards(
    { commit }: ActionContext<CardsState, MyRootState>,
    payload: CardsState
  ): Promise<void | boolean> {
    try {
      commit("cards/SET_CARDS" as RootCommitType, payload, { root: true });
      return Promise.resolve(true);
    } catch (error) {
      console.error(error);
      return Promise.resolve(false);
    }
  },
  async deleteCard(
    { commit }: ActionContext<CardsState, MyRootState>,
    index: number
  ): Promise<void | boolean> {
    try {
      commit("cards/DELETE_CARD" as RootCommitType, index, { root: true });
      return Promise.resolve(true);
    } catch (error) {
      console.error(error);
      return Promise.resolve(false);
    }
  },
  async editCard(
    { commit }: ActionContext<CardsState, MyRootState>,
    payload: { index: number; text: string }
  ): Promise<void | boolean> {
    try {
      commit("cards/EDIT_CARD" as RootCommitType, payload, { root: true });
      return Promise.resolve(true);
    } catch (error) {
      console.error(error);
      return Promise.resolve(false);
    }
  },
};
const getters = {
  todos(state: CardsState): Card[] | [] {
    return state.cards || [];
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
