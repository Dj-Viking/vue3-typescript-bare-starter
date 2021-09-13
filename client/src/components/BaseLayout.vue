<template>
  <div>
    <nav>
      <router-link class="link" :to="'/'">Home</router-link>
      <span class="divider">|</span>
      <router-link class="link" :to="'/login'">Login</router-link>
      <span class="divider">|</span>
      <router-link class="link" :to="'/signup'">Signup</router-link>
    </nav>
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "BaseLayout",
});
</script>
<style lang="scss" scoped>
.divider {
  color: green;
  font-size: 40px;
  margin-left: 10px;
  margin-right: 10px;
}
.link {
  color: green;
  font-size: 40px;
}
</style>
