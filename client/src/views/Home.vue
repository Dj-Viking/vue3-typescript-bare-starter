<template>
  <BaseLayout :isHome="true">
    <div>
      <TodoList />
    </div>
  </BaseLayout>
</template>

<script lang="ts">
import { ref, defineComponent, onMounted } from "vue";
import TodoList from "../components/TodoList.vue"; // @ is an alias to /src but stopped working for some reason UGH
import BaseLayout from "../components/BaseLayout.vue";
import { useQuery } from "@vue/apollo-composable";
import gql from "graphql-tag";
import { createGetUserTodosQuery } from "../graphql/queries/myQueries";
import { GetUserTodosResponse, RootDispatchType } from "../types";
import store from "../store";
import { ApolloQueryResult } from "@apollo/client/core";

export default defineComponent({
  name: "Home",
  components: {
    TodoList,
    BaseLayout,
  },
  setup(this: void) {
    const todos = ref();
    const { result: getTodosResult, onResult } = useQuery(
      gql`
        ${createGetUserTodosQuery()}
      `
    );

    onMounted(() => {
      onResult((result: ApolloQueryResult<GetUserTodosResponse>) => {
        if (result.data.getUserTodos.errors?.length) {
          todos.value = store.state.todos.todos;
          console.log("store on mounted", store);
          console.log("todos in on mounted result callback", todos);
          console.log("has errors", result.data.getUserTodos.errors);
        } else {
          console.log("store on mounted", store);
          todos.value = result.data.getUserTodos.todos;
          store.dispatch(
            "todos/setTodos" as RootDispatchType,
            result.data.getUserTodos.todos,
            { root: true }
          );
          console.log("todos in onmounted result callback", todos);
        }
      });
    });

    return {
      getTodosResult,
      todos,
    };
  },
  mounted() {
    document.title = "Home";
  },
});
</script>
