<template>
  <div>
    <nav>
      <router-link class="link" :to="'/'">Home</router-link>
      <span class="divider">|</span>
      <router-link class="link" :to="'/login'">Login</router-link>
      <span class="divider">|</span>
      <router-link class="link" :to="'/signup'">Signup</router-link>
    </nav>
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent, inject } from "vue";
import { useQuery } from "@vue/apollo-composable";
import gql from "graphql-tag";
import { MeQueryResponse } from "../types";
import { createMeQuery } from "../graphql/queries/myQueries";

export default defineComponent({
  name: "BaseLayout",
  setup() {
    //graphql me query for checking if the token is expired.
    //basically if the backend returns a token whenever the route changes. the user gets a new token. otherwise if user is idle on the page, the token would expire after about an hour...for now
    let globalEmail = inject("$email");
    const { result: meResult, refetch } = useQuery(
      gql`
        ${createMeQuery()}
      `
    );

    return { meResult, refetch, globalEmail };
  },
  watch: {
    $route: async function () {
      await this.refetch();
    },
    meResult: function (newValue: MeQueryResponse) {
      console.log("value of me query result", newValue);
    },
  },
});
</script>
<style lang="scss" scoped>
.divider {
  color: green;
  font-size: 40px;
  margin-left: 10px;
  margin-right: 10px;
}
.link {
  color: green;
  font-size: 40px;
}
</style>
