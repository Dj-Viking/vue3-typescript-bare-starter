<template>
  <BaseLayout>
    <form
      class="field box"
      style="margin: 0 20%"
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
      <label class="label mt-0">Email</label>
      <input
        class="input mt-4"
        type="text"
        name="email"
        v-model="email"
        placeholder="example@mail.com"
        required
      />
      <label class="label mt-4">Password</label>
      <input
        class="input mt-4"
        type="password"
        name="password"
        v-model="password"
        placeholder="*****************"
        required
      />
      <button v-if="!isLoading" class="button is-success mt-5">Login</button>
      <button
        v-if="isLoading"
        is-loading
        class="button is-loading is-success mt-5"
      >
        Login
      </button>
      <div
        v-if="showError"
        style="border-radius: 10px"
        class="has-background-danger-light mt-4"
      >
        <p class="has-text-danger">Error: {{ errMsg }}</p>
      </div>
      <div
        v-if="showSuccess"
        style="border-radius: 10px"
        class="has-background-success-light mt-4"
      >
        <p class="has-text-success">{{ successMsg }}</p>
      </div>
    </form>
  </BaseLayout>
</template>
<script lang="ts">
import { useMutation } from "@vue/apollo-composable";
import gql from "graphql-tag";
import { defineComponent, inject, ref, onMounted } from "vue";
import BaseLayout from "../components/BaseLayout.vue";
import { createLoginMutation } from "../graphql/mutations/myMutations";
import { LoginResponse, RootCommitType } from "../types";
import auth from "../utils/AuthService";
import router from "../router";
import store from "../store";
import { FetchResult } from "@apollo/client/core";

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
    const errMsg = ref("");
    const showError = ref(false);
    const successMsg = ref("");
    const showSuccess = ref(false);
    const isLoading = ref(false);
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

    onLoginDone(
      (
        result: FetchResult<
          LoginResponse,
          Record<string, unknown>,
          Record<string, unknown>
        >
      ) => {
        if (result?.data?.login.errors) {
          showError.value = true;
          errMsg.value = result?.data?.login.errors[0].message as string;
          setTimeout(() => {
            showError.value = false;
            errMsg.value = "";
          }, 2000);
        } else {
          isLoading.value = true;
          successMsg.value = "Success! Teleporting to Home Page!";
          showSuccess.value = true;
          setTimeout(() => {
            isLoading.value = false;
            showSuccess.value = false;
            successMsg.value = "";
            loginResponse.value = result.data as LoginResponse;
            globalEmail = result?.data?.login.user?.email;
            auth.setToken(result?.data?.login.token as string);
            auth.setEmail(globalEmail as string);
            router.push("/");
          }, 2000);
        }
      }
    );

    onMounted(() => {
      document.title = "Login";
    });

    return {
      email,
      showError,
      showSuccess,
      errMsg,
      successMsg,
      loginResponse,
      password,
      submitLogin,
      loginIsLoading,
      isLoading,
      loginError,
      globalEmail,
    };
  },
  methods: {
    // to make tscheck compiler happy.
    // eslint-disable-next-line
    readEvent(_event: Event): void {
      //do nothing
    },
  },
  watch: {
    loginResponse: function (newValue: LoginResponse) {
      console.log("login response new value", newValue);
      store.commit("user/SET_USER" as RootCommitType, newValue.login.user, {
        root: true,
      });
    },
  },
});
</script>
