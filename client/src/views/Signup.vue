<template>
  <BaseLayout>
    <form
      class="field box"
      style="margin: 0 20%"
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
      <label class="mt-0 label">Username</label>
      <input
        class="mt-4 input"
        type="text"
        name="username"
        v-model="username"
        placeholder="Username"
      />
      <label class="mt-4 label">Email</label>
      <input
        class="mt-4 input"
        type="text"
        name="email"
        v-model="email"
        placeholder="example@mail.com"
        required
      />
      <label class="mt-4 label">Password</label>
      <input
        class="mt-4 input"
        type="password"
        name="password"
        v-model="password"
        placeholder="***************"
        required
      />
      <button v-if="!isLoading" class="button is-success mt-5">Sign Up!</button>
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
import { defineComponent, inject, onMounted, ref } from "vue";
import BaseLayout from "../components/BaseLayout.vue";
import { useMutation } from "@vue/apollo-composable";
import { gql } from "graphql-tag";
import { createRegisterMutation } from "../graphql/mutations/myMutations";
import { RegisterResponse, RootCommitType } from "../types";
import auth from "../utils/AuthService";
import router from "../router";
import { FetchResult } from "@apollo/client/core";
import store from "../store";

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
    const errMsg = ref("");
    const showError = ref(false);
    const successMsg = ref("");
    const showSuccess = ref(false);
    const isLoading = ref(false);

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

    onRegisterDone(
      (
        result: FetchResult<
          RegisterResponse,
          Record<string, unknown>,
          Record<string, unknown>
        >
      ) => {
        if (result?.data?.register.errors) {
          showError.value = true;
          errMsg.value = result?.data?.register.errors[0].message as string;
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
            registerResponse.value = result?.data as RegisterResponse;
            submitted.value = false;
            globalEmail = result?.data?.register.user?.email;
            auth.setToken(result?.data?.register.token as string);
            auth.setEmail(globalEmail as string);
            router.push("/");
          }, 2000);
        }
      }
    );
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
      showError,
      showSuccess,
      errMsg,
      successMsg,
      username,
      password,
      isLoading,
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
  watch: {
    registerResponse: function (newValue: RegisterResponse): void {
      if (newValue.register.errors?.length) {
        auth.clearToken();
        auth.setEmail("");
        store.commit("user/CLEAR_USER_TOKEN" as RootCommitType, null, {
          root: true,
        });
      } else {
        store.commit(
          "user/SET_USER" as RootCommitType,
          newValue.register.user,
          { root: true }
        );
        auth.setToken(newValue.register.user?.token as string);
      }
    },
  },
});
</script>
