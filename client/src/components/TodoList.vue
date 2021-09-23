<template>
  <div>
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
    <div v-if="todos.length > 0">
      <h3>Your Todos</h3>
      <div
        style="border: black 2px solid; margin: 10px"
        v-for="(todo, i) in todos"
        :key="i"
      >
        <p :style="`color: ${todo.color}`">
          {{ todo.text }}
          <span style="color: blue">updated at: {{ todo.updatedAt }}</span>
        </p>
        <button
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
          @click.prevent="
            ($event) => {
              editTodo($event, todo.id);
              if (isLoggedIn) {
                submitEditUserTodo({
                  text: promptText,
                  id: todo.id,
                });
              }
            }
          "
        >
          edit todo
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
        <input type="text" @input="textInput($event)" v-model="input" />
        <pre style="color: black">
          {{ input }}
        </pre>
        <button class="button is-info" type="submit">Add todo</button>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import {
  AddTodoResponse,
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
  createEditTodoMutation,
} from "../graphql/mutations/myMutations";
import { FetchResult } from "@apollo/client/core";
// import { Store } from "vuex";

// interface MyDOMInputEvent extends Event {
//   target: EventTarget & {
//     //for some reason value isn't a property on the vanilla EventTarget type given by typescript....
//     // so we are forcing it to be a property
//     value: number | string;
//   };
// }

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

    const { mutate: submitEditUserTodo } = useMutation(
      gql`
        ${createEditTodoMutation()}
      `,
      {
        variables: {
          text: promptText.value,
          id: inputId.value,
        },
      }
    );

    return {
      input,
      promptText,
      submitClearUserTodos,
      submitEditUserTodo,
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
    // eslint-disable-next-line
    async editTodo(_event: any, id: number): Promise<void> {
      this.promptText = prompt("enter some text to edit this todo") as string;
      if (!this.promptText) return;
      const payload = {
        text: this.promptText,
        id,
      };
      await store.dispatch("todos/editTodo" as RootDispatchType, payload, {
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
<style scoped lang="scss"></style>
