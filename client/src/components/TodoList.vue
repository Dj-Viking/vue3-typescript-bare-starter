<template>
  <div>
    <button class="button is-info" @click.prevent="clearTodos($event)">
      clear todos
    </button>
    <div v-if="todos.length > 0">
      <div
        style="border: black 2px solid; margin: 10px"
        v-for="(todo, i) in todos"
        :key="i"
      >
        <p :style="`color: ${todo.color}`">
          {{ todo.text }}
        </p>
        <button @click.prevent="deleteTodo($event, i)">delete todo</button>
        <button @click.prevent="editTodo($event, i)">edit todo</button>
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
            if (input) {
              submitAddTodo({
                text: input,
              });
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
} from "../types";
import { ref, defineComponent } from "vue";
import store from "../store";
import { useMutation } from "@vue/apollo-composable";
import gql from "graphql-tag";
import { createAddTodoMutation } from "../graphql/mutations/myMutations";
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

    return {
      input,
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
    };
  },
  computed: {
    todos: (): TodosState["todos"] => store.state.todos.todos,
  },
  methods: {
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
    async editTodo(_event: any, index: number): Promise<void> {
      const text: string | null = prompt("enter some text to edit this todo");
      if (!text) return;
      const payload = {
        text,
        index,
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
