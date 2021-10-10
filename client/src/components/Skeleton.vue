<template>
  <div>im a skeleton of different types based on passed in props</div>
  <div v-if="half">I will be a skeleton of half column size</div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";

export default defineComponent({
  name: "Skeleton",
  props: {
    half: Boolean,
  },
});
</script>
