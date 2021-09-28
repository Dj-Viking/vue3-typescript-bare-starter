<template>
  <div class="container some-unique-class">
    <button
      class="button is-info"
      @click.prevent="
        ($event) => {
          //clear local cards
          clearCards($event);
          if (isLoggedIn) {
            submitClearUserCards();
          }
        }
      "
    >
      clear cards
    </button>
    <div class="container is-widescreen" v-if="cards.length > 0">
      <h3>Your Cards</h3>
      <div class="notification is-light" v-for="(card, i) in cards" :key="i">
        <p :style="`color: ${card.color}`">
          {{ card.text }}
          <span style="color: blue">updated at: {{ card.updatedAt }}</span>
        </p>
        <button
          class="button is-danger"
          @click.prevent="
            ($event) => {
              //update vuex cards that are displayed
              deleteCard($event, card.id);
              //only delete user's cards if they are logged in
              if (isLoggedIn) {
                submitDeleteCard({
                  id: card.id,
                });
              }
            }
          "
        >
          delete card
        </button>
        <button
          class="button is-primary"
          style="color: black"
          @click.prevent="
            ($event) => {
              openEditModal($event, card.id);
            }
          "
        >
          Edit Card
        </button>
      </div>
    </div>
    <div v-else>
      <span>no cards to display...</span>
    </div>

    <div style="margin-top: 100px">
      <form
        @submit.prevent="
          ($event) => {
            readInputEvent($event);
            if (input && isLoggedIn) {
              submitAddCard({
                text: input,
              });
              input = '';
            } else {
              //do a local update in the non logged in state update of cards
              addALocalCard();
            }
          }
        "
      >
        <div class="field">
          <div class="control">
            <input
              class="input"
              style="width: 30%"
              type="text"
              name="textInput"
              @input="textInput($event)"
              v-model="input"
            />
          </div>
        </div>
        <div class="control">
          <button class="button is-info mt-3" type="submit">Add Card</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import {
  AddCardResponse,
  EditCardModalContext,
  RootCommitType,
  RootDispatchType,
  CardsState,
  UserState,
} from "../types";
import { ref, defineComponent } from "vue";
import store from "../store";
import { useMutation } from "@vue/apollo-composable";
import gql from "graphql-tag";
import {
  createAddCardMutation,
  createDeleteCardMutation,
  createClearUserCardsMutation,
  // createEditCardMutation,
} from "../graphql/mutations/myMutations";
import { FetchResult } from "@apollo/client/core";
import { Card } from "../../../server/src/types";
import { useToast } from "vue-toastification";
// import { Store } from "vuex";

export default defineComponent({
  name: "CardList",
  setup(this: void) {
    const toast = useToast();
    const promptText = ref("");
    const inputId = ref(0);
    const input = ref("");
    const errMsg = ref("");
    const successMsg = ref("");
    const showSuccess = ref(false);
    const showError = ref(false);
    const {
      mutate: submitAddCard,
      loading: addCardIsLoading,
      error: addCardError,
      onDone: onAddCardDone,
    } = useMutation(
      gql`
        ${createAddCardMutation()}
      `,
      {
        variables: {
          text: input.value,
        },
      }
    );

    onAddCardDone(
      (
        result: FetchResult<
          AddCardResponse,
          Record<string, unknown>,
          Record<string, unknown>
        >
      ) => {
        if (result.data?.addCard.errors) {
          toast.error(
            `Error: there was an error adding a todo - ${result.data?.addCard.errors[0].message}`,
            {
              timeout: 3000,
            }
          );
        } else {
          toast.success("Success: added a todo to your list!", {
            timeout: 3000,
          });
          // successMsg.value = "Added a TODO!!";
          // showSuccess.value = true;
          store.commit(
            "cards/SET_CARDS" as RootCommitType,
            result.data?.addCard.cards,
            {
              root: true,
            }
          );
        }
      }
    );

    const { mutate: submitDeleteCard } = useMutation(
      gql`
        ${createDeleteCardMutation()}
      `,
      {
        variables: {
          //using a ref as a type definition of the input that will happen later
          id: inputId.value,
        },
      }
    );
    const { mutate: submitClearUserCards } = useMutation(
      gql`
        ${createClearUserCardsMutation()}
      `
    );

    return {
      input,
      promptText,
      submitClearUserCards,
      inputId,
      submitDeleteCard,
      showError,
      showSuccess,
      errMsg,
      successMsg,
      addCardIsLoading,
      addCardError,
      submitAddCard,
      toast,
    };
  },
  data() {
    return {
      inputText: "",
      store: store,
    };
  },
  computed: {
    cards: (): CardsState["cards"] => store.state.cards.cards,
    isLoggedIn: (): UserState["user"]["loggedIn"] =>
      store.state.user.user.loggedIn,
    activeClass: () => store.state.modal.modal.activeClass,
  },
  methods: {
    addALocalCard(): void {
      if (!this.input) return;
      store.state.cards.cards.push({
        id: Date.now(),
        text: this.input,
        color: "green",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      this.input = "";
    },
    readInputEvent(event: Event) {
      console.log("add card event", event);
    },
    async deleteCard(_event: Event, index: number): Promise<void> {
      await store.dispatch("cards/deleteCard" as RootDispatchType, index, {
        root: true,
      });
    },
    // eslint-disable-next-line
    clearCards(_event: Event): void {
      store.commit("cards/SET_CARDS" as RootCommitType, [], { root: true });
    },
    // eslint-disable-next-line
    async addCard(_event: Event): Promise<void | boolean> {
      if (!this.inputText) return;
      const payload = {
        id: Date.now(),
        text: this.inputText,
        color: "blue",
      };
      const addResponse: boolean = await store.dispatch(
        "cards/addCard" as RootDispatchType,
        payload,
        {
          root: true,
        }
      );
      this.inputText = "";
      return addResponse;
    },
    openEditModal(event: Event, id: Card["id"]) {
      console.log(
        "able to get id in this loop to also open the modal?????",
        id
      );
      console.log("open modal from card list", event);
      //adding to element classlist under the hood
      store.commit("modal/SET_MODAL_TITLE", "Edit a card", {
        root: true,
      });
      const payload: EditCardModalContext = {
        cardId: id,
      };
      store.commit("modal/SET_MODAL_CONTEXT" as RootCommitType, payload, {
        root: true,
      });
      store.commit("modal/SET_MODAL_ACTIVE" as RootCommitType, true, {
        root: true,
      });
    },
    // eslint-disable-next-line
    textInput(event: any): void {
      this.inputText = event.target.value as string;
    },
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.some-unique-class {
  margin-top: 1px;
}
</style>
