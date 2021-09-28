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
                class="button is-info"
                @click.prevent="
                  ($event) => {
                    closeModal($event);
                    if (isLoggedIn) {
                      //graphql mutation pass data to the modal for it to use.
                      submitEditUserCard({
                        text: inputText,
                        id: modalContext?.cardId,
                      });
                      closeModal();
                      inputText = '';
                    } else {
                      editLocalCard($event, {
                        text: inputText,
                        id: modalContext?.cardId,
                      });
                      inputText = '';
                    }
                  }
                "
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
      @click.prevent="closeModal($event)"
      class="modal-close is-large"
      aria-label="close"
    ></button>
  </div>
</template>

<script lang="ts">
import { createEditCardMutation } from "@/graphql/mutations/myMutations";
import {
  ModalState,
  RootCommitType,
  UserState,
  EditCardResponse,
  Card,
  EditCardCommitPayload,
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
    const { mutate: submitEditUserCard, onDone: onEditCardDone } = useMutation(
      gql`
        ${createEditCardMutation()}
      `,
      {
        variables: {
          text: inputText.value,
          id: inputId.value,
        },
      }
    );

    onEditCardDone(
      (
        result: FetchResult<
          EditCardResponse,
          Record<string, unknown>,
          Record<string, unknown>
        >
      ) => {
        if (result.data?.editCardById.errors) {
          showErrMsg.value = true;
          errMsg.value = result.data?.editCardById.errors[0].message;
          inputText.value = "";
        } else {
          editResponse.value = result.data;
          store.commit(
            "cards/SET_CARDS" as RootCommitType,
            result.data?.editCardById.cards as Card[],
            { root: true }
          );
        }
      }
    );
    return {
      inputText,
      submitEditUserCard,
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
    closeModal(event?: MouseEvent): void {
      console.log("close modal event", event);
      store.commit("modal/SET_MODAL_ACTIVE" as RootCommitType, false, {
        root: true,
      });
    },
    editLocalCard(_event: MouseEvent, payload: EditCardCommitPayload): void {
      console.log("editing a local card if not logged in", _event);
      store.commit("cards/EDIT_CARD" as RootCommitType, payload, {
        root: true,
      });
    },
    closeModalViaEsc(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        console.log("close modal event with escape key", event);
        store.commit("modal/SET_MODAL_ACTIVE" as RootCommitType, false, {
          root: true,
        });
      } else return;
    },
  },
  created: function (): void {
    document.addEventListener("keyup", this.closeModalViaEsc);
  },
  unmounted: function (): void {
    document.removeEventListener("keyup", this.closeModalViaEsc);
  },
});
</script>

<style lang="scss"></style>
