<template>
  <BaseLayout>
    <form
      @submit.prevent="
        ($event) => {
          let event = $event;
          readEvent(event);
          submitLogin({
            options: {
              email,
              password,
            },
          });
        }
      "
    >
      <label>email</label>
      <input type="text" v-model="email" />
      <label>password</label>
      <input type="password" v-model="password" />
      <button class="button is-success">Login</button>
    </form>
  </BaseLayout>
</template>
<script lang="ts">
import { useMutation } from "@vue/apollo-composable";
import gql from "graphql-tag";
import { defineComponent, inject, ref } from "vue";
import BaseLayout from "../components/BaseLayout.vue";
import { createLoginMutation } from "../graphql/mutations/myMutations";
import { LoginResponse } from "../types";
import auth from "../utils/AuthService";

export default defineComponent({
  name: "Login",
  components: {
    BaseLayout,
  },
  setup(this: void) {
    let globalEmail = inject("$email");
    const email = ref("");
    const password = ref("");
    const loginResponse = ref();
    const {
      mutate: submitLogin,
      loading: loginIsLoading,
      error: loginError,
      onDone: onLoginDone,
    } = useMutation(
      gql`
        ${createLoginMutation()}
      `,
      {
        variables: {
          options: {
            email: email.value,
            password: password.value,
          },
        },
      }
    );

    onLoginDone((result) => {
      loginResponse.value = result.data as LoginResponse;
      globalEmail = result.data.login.user.email;
      auth.setToken(result.data.login.user.token);
      auth.setEmail(globalEmail as string);
    });

    return {
      email,
      password,
      submitLogin,
      loginIsLoading,
      loginError,
      globalEmail,
    };
  },
  methods: {
    // to make tscheck compiler happy.
    // eslint-disable-next-line
    readEvent(_event: Event) {
      //do nothing
    },
  },
});
</script>
