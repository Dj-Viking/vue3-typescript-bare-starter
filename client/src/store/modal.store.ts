// import { MyRootState, RootCommitType, RootDispatchType } from "@/types";
// import { ActionContext } from "vuex";

import { ModalState } from "../../src/types";

const state: ModalState = {
  modal: {
    context: {
      todoId: 0,
    },
    activeClass: false, //inactive by default
    title: "initiall title",
  },
};
const mutations = {
  SET_MODAL_ACTIVE(state: ModalState, payload: boolean): void {
    console.log("calling vuex open modal active commit", payload);
    state.modal.activeClass = payload;
  },
  SET_MODAL_TITLE(state: ModalState, payload: string): void {
    state.modal.title = payload;
  },
  SET_MODAL_CONTEXT(
    state: ModalState,
    payload: ModalState["modal"]["context"]
  ): void {
    state.modal.context = {
      ...state.modal.context,
      ...payload,
    };
  },
  CLEAR_MODAL_CONTEXT(state: ModalState): void {
    state.modal.context = {
      todoId: 0,
    };
  },
};
const actions = {};
const getters = {};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
