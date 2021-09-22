<template>
  <div>
    <button class="button is-info" @click.prevent="clearTodos($event)">
      clear todos
    </button>
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

    <div style="margin-top: 100px">
      <form @submit.prevent="addTodo($event)">
        <input type="text" @input="textInput($event)" :value="inputText" />
        <pre style="color: black">
          {{ inputText }}
        </pre>
        <button class="button is-info" type="submit">Add todo</button>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { RootCommitType, RootDispatchType, TodosState } from "../types";
import { defineComponent } from "vue";
import store from "../store";
// import { Store } from "vuex";

interface MyDOMInputEvent extends Event {
  target: EventTarget & {
    //for some reason value isn't a property on the vanilla EventTarget type given by typescript....
    // so we are forcing it to be a property
    value: number | string;
  };
}

export default defineComponent({
  name: "TodoList",
  data() {
    return {
      inputText: "",
    };
  },
  computed: {
    todos: (): TodosState["todos"] => store.state.todos.todos,
  },
  methods: {
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
    textInput(event: MyDOMInputEvent): void {
      this.inputText = event.target.value as string;
    },
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss"></style>
