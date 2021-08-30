<template>
  <div
    style="border: black 2px solid; margin: 10px"
    v-for="(todo, i) in todos"
    :key="i"
  >
    <p>
      {{ todo.text }}
    </p>
    <button @click.prevent="deleteTodo($event, i)">delete todo</button>
    <button @click.prevent="editTodo($event, i)">edit todo</button>
  </div>

  <div style="margin-top: 100px">
    <input type="text" @input="textInput($event)" :value="inputText" />
    <pre style="color: black">
      {{ inputText }}
    </pre>
    <button @click.prevent="addTodo($event)">Add todo</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Todo } from "../types";

interface MyDOMInputEvent extends Event {
  target: EventTarget & {
    //for some reason value isn't a property on the vanilla EventTarget type given by typescript....
    // so we are forcing it to be a value
    value: number | string;
  };
}

export default defineComponent({
  name: "TodoList",
  data() {
    return {
      todos: [] as Array<Todo>,
      inputText: "",
    };
  },
  methods: {
    initList() {
      for (let i = 0; i < 2; i++) {
        this.todos.push({
          id: i + 1,
          text: `something at ${i}`,
          color: "green",
        });
      }
    },
    deleteTodo(_event: Event, index: number) {
      this.todos.splice(index, 1);
    },
    // eslint-disable-next-line
    addTodo(_event: Event) {
      if (!this.inputText) return;
      this.todos.push({
        id: Date.now(),
        text: this.inputText,
        color: "blue",
      });
      this.inputText = "";
    },
    // eslint-disable-next-line
    editTodo(_event: any, index: number) {
      const text = prompt("enter some text to edit this todo");
      if (!text) return;
      this.todos[index].text = text as string;
    },
    textInput(event: MyDOMInputEvent) {
      this.inputText = event.target.value as string;
    },
  },
  mounted() {
    this.initList();
    console.log("todos", this.todos);
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss"></style>
