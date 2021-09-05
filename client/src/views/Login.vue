<template>
  <BaseLayout>
    <div>login page</div>
  </BaseLayout>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import BaseLayout from "@/components/BaseLayout.vue";

export default defineComponent({
  name: "Login",
  components: {
    BaseLayout,
  },
  mounted() {
    document.title = "Login";
  },
});
</script>
