<template>
  <BaseLayout>
    <form
      @submit.prevent="
        ($event) => {
          let event = $event;
          readEvent(event);
          submitRegister({
            options: {
              email,
              username,
              password,
            },
          });
        }
      "
    >
      <label>username</label>
      <input type="text" v-model="username" />
      <label>email</label>
      <input type="text" v-model="email" />
      <label>password</label>
      <input type="password" v-model="password" />
      <button class="button is-success">Sign Up!</button>
    </form>
  </BaseLayout>
</template>
<script lang="ts">
import { defineComponent, inject, onMounted, ref } from "vue";
import BaseLayout from "../components/BaseLayout.vue";
import { useMutation } from "@vue/apollo-composable";
import { gql } from "graphql-tag";
import { createRegisterMutation } from "../graphql/mutations/myMutations";
import { RegisterResponse } from "../types";
import auth from "../utils/AuthService";

export default defineComponent({
  name: "Signup",
  components: {
    BaseLayout,
  },
  setup(this: void) {
    let globalEmail = inject("$email");
    const email = ref("");
    const username = ref("");
    const password = ref("");
    const registerResponse = ref();
    const submitted = ref(false);

    const {
      mutate: submitRegister,
      loading: registerIsLoading,
      error: registerError,
      onDone: onRegisterDone,
    } = useMutation(
      gql`
        ${createRegisterMutation()}
      `,
      {
        variables: {
          options: {
            email: email.value,
            username: username.value,
            password: password.value,
          },
        },
      }
    );

    onRegisterDone((result) => {
      registerResponse.value = result.data as RegisterResponse;
      submitted.value = false;
      globalEmail = result?.data?.register.user.email;
      auth.setToken(result.data.register.token);
    });
    function initFields(): void {
      submitted.value = false;
      email.value = "";
      username.value = "";
      password.value = "";
    }
    onMounted(() => {
      initFields();
      document.title = "Sign Up";
    });

    return {
      submitRegister,
      email,
      username,
      password,
      registerIsLoading,
      globalEmail,
      registerError,
      registerResponse,
      submitted,
    };
  },
  methods: {
    //to make the ts check compiler happy
    // eslint-disable-next-line
    readEvent(_event: Event): void {
      // do nothing
    },
  },
});
</script>
