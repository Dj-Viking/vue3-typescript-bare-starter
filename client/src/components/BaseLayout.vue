<template>
  <div>
    <nav>
      <div v-if="!isHome">
        <router-link class="link" :to="'/'">Home</router-link>
      </div>

      <div v-if="isHome">
        <div v-if="isLoggedIn">
          <span
            style="cursor: pointer"
            class="link"
            @click.prevent="
              ($event) => {
                readEvent($event);
                logout();
              }
            "
            >Logout</span
          >
        </div>
        <div v-if="!isLoggedIn">
          <router-link class="link" :to="'/login'">Login</router-link>
          <span class="divider">|</span>
          <router-link class="link" :to="'/signup'">Signup</router-link>
        </div>
      </div>
    </nav>
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent, inject } from "vue";
import { useQuery } from "@vue/apollo-composable";
import gql from "graphql-tag";
import { mapState } from "vuex";
import {
  MeQueryResponse,
  // MyRootState,
  RootCommitType,
  RootDispatchType,
} from "../types";
import { createMeQuery } from "../graphql/queries/myQueries";
import auth from "../utils/AuthService";
import store from "../store";

export default defineComponent({
  name: "BaseLayout",
  props: ["isHome"],
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
  computed: {
    ...mapState(["user"]),
  },
  data() {
    return {
      isLoggedIn: false,
    };
  },
  methods: {
    // eslint-disable-next-line
    readEvent(_event: Event): void {
      //do nothing
      console.log(_event);
    },
    async logout() {
      auth.setToken("");
      this.isLoggedIn = false;
      //refetching after setting the token to
      //empty string will not allow for a refresh token on the site
      this.refetch();
      await store.dispatch("todos/setTodos" as RootDispatchType, [], {
        root: true,
      });
    },
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
        this.isLoggedIn = false;
        await store.dispatch("user/setUser", null, { root: true });
        store.commit(
          "todos/SET_TODOS" as RootCommitType,
          [
            {
              text: "sign in to see and add your own todos!!!",
              id: Date.now(),
            },
          ],
          { root: true }
        );
        store.commit("user/SET_LOGGED_IN" as RootCommitType, false, {
          root: true,
        });
      } else {
        console.log("value of me query result", newValue);
        //set new token in storage
        auth.setToken(newValue.me.user.token as string);
        store.commit("user/SET_LOGGED_IN" as RootCommitType, true, {
          root: true,
        });
        this.isLoggedIn = true;
        store.commit("todos/SET_TODOS" as RootCommitType, newValue.me.todos, {
          root: true,
        });
        //set user vuex state with todos
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
  async mounted() {
    console.log("todos vuex state on mounted", store.state.todos);
    //set the todos if there are any defined
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
