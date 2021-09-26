<template>
  <div class="container some-unique-class">
    <button
      class="button is-info"
      @click.prevent="
        ($event) => {
          //clear local todos
          clearTodos($event);
          if (isLoggedIn) {
            submitClearUserTodos();
          }
        }
      "
    >
      clear todos
    </button>
    <div class="container is-widescreen" v-if="todos.length > 0">
      <h3>Your Todos</h3>
      <div class="notification is-light" v-for="(todo, i) in todos" :key="i">
        <p :style="`color: ${todo.color}`">
          {{ todo.text }}
          <span style="color: blue">updated at: {{ todo.updatedAt }}</span>
        </p>
        <button
          class="button is-danger"
          @click.prevent="
            ($event) => {
              //update vuex todos that are displayed
              deleteTodo($event, todo.id);
              //only delete user's todos if they are logged in
              if (isLoggedIn) {
                submitDeleteTodo({
                  id: todo.id,
                });
              }
            }
          "
        >
          delete todo
        </button>
        <button
          class="button is-primary"
          style="color: black"
          @click.prevent="
            ($event) => {
              openEditModal($event, todo.id);
              // if (isLoggedIn) {
              //   // submitEditUserTodo({
              //   //   text: promptText,
              //   //   id: todo.id,
              //   // });
              // }
            }
          "
        >
          Edit Todo
        </button>
      </div>
    </div>
    <div v-else>
      <span>no todos to display...</span>
    </div>

    <div style="margin-top: 100px">
      <form
        @submit.prevent="
          ($event) => {
            readInputEvent($event);
            if (input && isLoggedIn) {
              submitAddTodo({
                text: input,
              });
              input = '';
            } else {
              //do a local update in the non logged in state update of todos
              addALocalTodo();
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

        <div>
          <div
            v-if="showError"
            style="border-radius: 10px; width: 30%"
            class="has-background-danger-light mt-4"
          >
            <div class="has-text-danger">Error: {{ errMsg }}</div>
          </div>
          <div
            v-if="showSuccess"
            style="border-radius: 10px; width: 30%; margin: 0 auto"
            class="has-background-success-light mt-4"
          >
            <div class="has-text-success">Success: {{ successMsg }}</div>
          </div>
        </div>
        <div v-if="!showSuccess" class="mt-4">&nbsp;</div>
        <div class="control">
          <button class="button is-info mt-3" type="submit">Add todo</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import {
  AddTodoResponse,
  EditTodoModalContext,
  RootCommitType,
  RootDispatchType,
  TodosState,
  UserState,
} from "../types";
import { ref, defineComponent } from "vue";
import store from "../store";
import { useMutation } from "@vue/apollo-composable";
import gql from "graphql-tag";
import {
  createAddTodoMutation,
  createDeleteTodoMutation,
  createClearUserTodosMutation,
  // createEditTodoMutation,
} from "../graphql/mutations/myMutations";
import { FetchResult } from "@apollo/client/core";
import { Todo } from "../../../server/src/types";
// import { Store } from "vuex";

export default defineComponent({
  name: "TodoList",
  setup(this: void) {
    const promptText = ref("");
    const inputId = ref(0);
    const input = ref("");
    const errMsg = ref("");
    const successMsg = ref("");
    const showSuccess = ref(false);
    const showError = ref(false);
    const {
      mutate: submitAddTodo,
      loading: addTodoIsLoading,
      error: addTodoError,
      onDone: onAddTodoDone,
    } = useMutation(
      gql`
        ${createAddTodoMutation()}
      `,
      {
        variables: {
          text: input.value,
        },
      }
    );

    onAddTodoDone(
      (
        result: FetchResult<
          AddTodoResponse,
          Record<string, unknown>,
          Record<string, unknown>
        >
      ) => {
        if (result.data?.addTodo.errors) {
          showError.value = true;
          errMsg.value = result?.data?.addTodo.errors[0].message as string;
          setTimeout(() => {
            showError.value = false;
            errMsg.value = "";
          }, 2000);
        } else {
          successMsg.value = "Added a TODO!!";
          showSuccess.value = true;
          store.commit(
            "todos/SET_TODOS" as RootCommitType,
            result.data?.addTodo.todos,
            {
              root: true,
            }
          );
          setTimeout(() => {
            showSuccess.value = false;
            successMsg.value = "";
          }, 2000);
        }
      }
    );

    const { mutate: submitDeleteTodo } = useMutation(
      gql`
        ${createDeleteTodoMutation()}
      `,
      {
        variables: {
          //using a ref as a type definition of the input that will happen later
          id: inputId.value,
        },
      }
    );
    const { mutate: submitClearUserTodos } = useMutation(
      gql`
        ${createClearUserTodosMutation()}
      `
    );

    // const { mutate: submitEditUserTodo } = useMutation(
    //   gql`
    //     ${createEditTodoMutation()}
    //   `,
    //   {
    //     variables: {
    //       text: promptText.value,
    //       id: inputId.value,
    //     },
    //   }
    // );

    return {
      input,
      promptText,
      submitClearUserTodos,
      // submitEditUserTodo,
      inputId,
      submitDeleteTodo,
      showError,
      showSuccess,
      errMsg,
      successMsg,
      addTodoIsLoading,
      addTodoError,
      submitAddTodo,
    };
  },
  data() {
    return {
      inputText: "",
      store: store,
    };
  },
  computed: {
    todos: (): TodosState["todos"] => store.state.todos.todos,
    isLoggedIn: (): UserState["user"]["loggedIn"] =>
      store.state.user.user.loggedIn,
    activeClass: () => store.state.modal.modal.activeClass,
  },
  methods: {
    addALocalTodo(): void {
      if (!this.input) return;
      store.state.todos.todos.push({
        id: Date.now(),
        text: this.input,
        color: "green",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      this.input = "";
    },
    readInputEvent(event: Event) {
      console.log("add todo event", event);
    },
    async deleteTodo(_event: Event, index: number): Promise<void> {
      await store.dispatch("todos/deleteTodo" as RootDispatchType, index, {
        root: true,
      });
    },
    // eslint-disable-next-line
    clearTodos(_event: Event): void {
      store.commit("todos/SET_TODOS" as RootCommitType, [], { root: true });
    },
    // eslint-disable-next-line
    async addTodo(_event: Event): Promise<void | boolean> {
      if (!this.inputText) return;
      const payload = {
        id: Date.now(),
        text: this.inputText,
        color: "blue",
      };
      const addResponse: boolean = await store.dispatch(
        "todos/addTodo" as RootDispatchType,
        payload,
        {
          root: true,
        }
      );
      this.inputText = "";
      return addResponse;
    },
    openEditModal(event: Event, id: Todo["id"]) {
      console.log(
        "able to get id in this loop to also open the modal?????",
        id
      );
      console.log("open modal from todo list", event);
      //adding to element classlist under the hood
      store.commit("modal/SET_MODAL_TITLE", "Edit a todo", {
        root: true,
      });
      const payload: EditTodoModalContext = {
        todoId: id,
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
