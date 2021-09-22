<template>
  <BaseLayout :isHome="true">
    <div>
      <TodoList />
    </div>
  </BaseLayout>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import TodoList from "../components/TodoList.vue"; // @ is an alias to /src but stopped working for some reason UGH
import BaseLayout from "../components/BaseLayout.vue";
import { useQuery } from "@vue/apollo-composable";
import gql from "graphql-tag";
import { createGetUserTodosQuery } from "../graphql/queries/myQueries";
import { GetUserTodosResponse } from "../types";
import store from "../store";
import { ApolloQueryResult } from "@apollo/client/core";

export default defineComponent({
  name: "Home",
  components: {
    TodoList,
    BaseLayout,
  },
  setup(this: void) {
    const { result: getTodosResult, onResult } = useQuery(
      gql`
        ${createGetUserTodosQuery()}
      `
    );

    onMounted(() => {
      onResult((result: ApolloQueryResult<GetUserTodosResponse>) => {
        if (result.data.getUserTodos.errors?.length) {
          console.log("store on mounted", store);

          console.log("has errors", result.data.getUserTodos.errors);
        } else {
          console.log("store on mounted", store);
        }
      });
    });

    return {
      getTodosResult,
    };
  },
  mounted() {
    document.title = "Home";
  },
});
</script>
