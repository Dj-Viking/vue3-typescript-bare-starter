<template>
  <BaseLayout :isHome="true">
    <div>
      <TodoList />
    </div>
  </BaseLayout>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import TodoList from "../components/TodoList.vue"; // @ is an alias to /src but stopped working for some reason UGH
import BaseLayout from "../components/BaseLayout.vue";
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
