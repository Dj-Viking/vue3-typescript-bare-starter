<template>
  <BaseLayout>
    <div>Signup page</div>
  </BaseLayout>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import BaseLayout from "@/components/BaseLayout.vue";

export default defineComponent({
  name: "Signup",
  components: {
    BaseLayout,
  },
  mounted() {
    document.title = "Signup";
  },
});
</script>
