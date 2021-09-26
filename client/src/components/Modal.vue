<template>
  <div :class="{ 'is-active': activeClass }" class="modal" name="modal">
    <div class="modal-background"></div>
    <div class="modal-content" style="width: 75%">
      <div v-if="/Edit/g.test(title)">
        <form>
          <div class="field">
            <div class="control">
              <label for="inputText" style="color: #00d1b2" class="label"
                >{{ title }}
              </label>
            </div>
          </div>
          <div class="field">
            <div class="control">
              <input
                name="modalEdit"
                type="text"
                class="input"
                v-model="inputText"
              />
            </div>
          </div>
          <div class="field">
            <div class="control">
              <button
                @click.prevent="
                  ($event) => {
                    closeModal($event);
                    if (isLoggedIn) {
                      //graphql mutation pass data to the modal for it to use.
                      submitEditUserTodo({
                        text: inputText,
                        id: modalContext?.todoId,
                      });
                      closeModal();
                      inputText = '';
                    }
                  }
                "
                class="button is-info"
              >
                SUBMIT EDIT
              </button>
              <span v-if="showErrMsg" class="has-text-danger"
                >Error {{ errMsg }}</span
              >
            </div>
          </div>
        </form>
      </div>
      <div v-else>
        <h3 style="color: white">{{ title }}</h3>
        <p style="color: white">something else</p>
      </div>
    </div>
    <button
      @keydown.esc.prevent="closeModalViaEsc($event)"
      @click.prevent="closeModal($event)"
      class="modal-close is-large"
      aria-label="close"
    ></button>
  </div>
</template>

<script lang="ts">
import { createEditTodoMutation } from "@/graphql/mutations/myMutations";
import {
  ModalState,
  RootCommitType,
  UserState,
  EditTodoResponse,
  Todo,
} from "@/types";
import { FetchResult } from "@apollo/client/core";
import { useMutation } from "@vue/apollo-composable";
import { defineComponent, ref } from "@vue/runtime-core";
import { gql } from "graphql-tag";
import store from "../store";
export default defineComponent({
  name: "Modal",
  setup() {
    const inputText = ref("");
    const inputId = ref(0);
    const errMsg = ref("");
    const showErrMsg = ref(false);
    const editResponse = ref();
    const { mutate: submitEditUserTodo, onDone: onEditTodoDone } = useMutation(
      gql`
        ${createEditTodoMutation()}
      `,
      {
        variables: {
          text: inputText.value,
          id: inputId.value,
        },
      }
    );

    onEditTodoDone(
      (
        result: FetchResult<
          EditTodoResponse,
          Record<string, unknown>,
          Record<string, unknown>
        >
      ) => {
        if (result.data?.editTodoById.errors) {
          showErrMsg.value = true;
          errMsg.value = result.data?.editTodoById.errors[0].message;
          inputText.value = "";
        } else {
          editResponse.value = result.data;
          store.commit(
            "todos/SET_TODOS" as RootCommitType,
            result.data?.editTodoById.todos as Todo[],
            { root: true }
          );
        }
      }
    );
    return {
      inputText,
      submitEditUserTodo,
      errMsg,
      showErrMsg,
    };
  },
  computed: {
    title: (): ModalState["modal"]["title"] => store.state.modal.modal.title,
    activeClass: (): ModalState["modal"]["activeClass"] =>
      store.state.modal.modal.activeClass,
    isLoggedIn: (): UserState["user"]["loggedIn"] =>
      store.state.user.user.loggedIn,
    modalContext: (): ModalState["modal"]["context"] =>
      store.state.modal.modal.context,
  },
  methods: {
    closeModal(event?: MouseEvent) {
      console.log("close modal event", event);
      store.commit("modal/SET_MODAL_ACTIVE" as RootCommitType, false, {
        root: true,
      });
    },
    closeModalViaEsc(event?: KeyboardEvent) {
      console.log("close modal event", event);
      store.commit("modal/SET_MODAL_ACTIVE" as RootCommitType, false, {
        root: true,
      });
    },
  },
  created: function () {
    document.addEventListener("keyup", this.closeModalViaEsc);
  },
  unmounted: function () {
    document.removeEventListener("keyup", this.closeModalViaEsc);
  },
});
</script>

<style lang="scss"></style>
