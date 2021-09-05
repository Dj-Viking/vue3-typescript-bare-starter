<template>
  <BaseLayout>
    <div>
      <TodoList />
    </div>
  </BaseLayout>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import TodoList from "@/components/TodoList.vue"; // @ is an alias to /src
import BaseLayout from "@/components/BaseLayout.vue";

export default defineComponent({
  name: "Home",
  components: {
    TodoList,
    BaseLayout,
  },
  mounted() {
    document.title = "Home";
  },
});
</script>
