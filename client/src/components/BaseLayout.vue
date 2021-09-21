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
import { MeQueryResponse, RootCommitType, RootDispatchType } from "../types";
import { createMeQuery } from "../graphql/queries/myQueries";
import auth from "../utils/AuthService";
import store from "../store";

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
    //callback to execute whenever the application router changes
    $route: async function () {
      await this.refetch();
    },
    meResult: async function (newValue: MeQueryResponse) {
      if (newValue.me.errors?.length) {
        auth.clearToken();
        auth.setEmail("");
        await store.dispatch("user/setUser", null, { root: true });
        store.commit("user/SET_LOGGED_IN" as RootCommitType, false, {
          root: true,
        });
      } else {
        console.log("value of me query result", newValue);
        //set new token in storage
        auth.setToken(newValue.me.user.token);
        store.commit("user/SET_LOGGED_IN" as RootCommitType, true, {
          root: true,
        });
        //set user vuex state
        await store.dispatch(
          "user/setUser" as RootDispatchType,
          { ...newValue.me.user },
          {
            root: true,
          }
        );
      }
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
