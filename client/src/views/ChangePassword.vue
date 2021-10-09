<template>
  <form
    class="field box"
    style="margin: 0 20%; margin-top: 2em"
    @submit.prevent="
      ($event) => {
        readEvent($event);
        isLoading = true;
        submitChangePassword({
          password: passwordInput,
          token: route.params.token || '',
        });
      }
    "
  >
    <div class="field">
      <label for="passwordInput" class="label">New Password</label>
      <div class="control">
        <input
          class="input"
          type="password"
          autocomplete="off"
          placeholder="***************"
          name="passwordInput"
          v-model="passwordInput"
          required
        />
      </div>
    </div>
    <button v-if="!isLoading" class="button is-success mt-5">Submit</button>
    <button
      v-if="isLoading"
      is-loading
      class="button is-loading is-success mt-5"
    >
      Login
    </button>
  </form>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "@vue/runtime-core";
import { useRoute } from "vue-router";
import { useMutation } from "@vue/apollo-composable";
import { createChangePasswordMutation } from "../graphql/mutations/myMutations";
import gql from "graphql-tag";
import { ChangePasswordResponse } from "@/types";
import { FetchResult } from "@apollo/client/core";
import { useToast } from "vue-toastification";
import router from "../router";
export default defineComponent({
  name: "ChangePass",
  setup(this: void) {
    const toast = useToast();
    const isLoading = ref(false);
    const route = useRoute();
    const passwordInput = ref("");
    const { mutate: submitChangePassword, onDone } = useMutation(
      gql`
        ${createChangePasswordMutation()}
      `,
      {
        variables: {
          password: passwordInput.value,
          token: route.params.token,
        },
      }
    );

    onDone(
      (
        result: FetchResult<
          ChangePasswordResponse,
          Record<string, unknown>,
          Record<string, unknown>
        >
      ): void => {
        console.log("what was the result", result.data);

        if (result.data?.changePassword?.errors?.length) {
          setTimeout(() => {
            isLoading.value = false;
          }, 1000);
          toast.error(result.data?.changePassword.errors[0].message, {
            timeout: 3000,
          });
        } else {
          setTimeout(() => {
            isLoading.value = false;
          }, 1000);
          toast.success("Changed Password!", {
            timeout: 3000,
          });
          router.push("/");
        }
      }
    );

    onMounted(() => {
      document.title = "Change Password";
    });

    return {
      passwordInput,
      isLoading,
      route,
      submitChangePassword,
    };
  },
  methods: {
    readEvent(event: Event): void {
      console.log("submit event for changing password", event);
    },
  },
});
</script>
