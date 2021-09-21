<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "App",
});
</script>

<style lang="scss">
#app {
  font-family: "Grechen Fuemen", cursive;
  font-family: "Imbue", serif;
  font-family: "Kosugi Maru", sans-serif;
  font-family: "Roboto", sans-serif;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
