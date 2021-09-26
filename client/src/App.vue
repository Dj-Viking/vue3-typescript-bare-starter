<template>
  <Modal />
  <!-- <Modalv2 /> -->
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from "vue";
// import Modalv2 from "./components/Modalv2.vue";
import Modal from "./components/Modal.vue";
import store from "./store";
import { RootCommitType } from "./types";
export default defineComponent({
  name: "App",
  components: {
    Modal,
    // Modalv2,
  },
  methods: {
    openModal(event: Event) {
      console.log("open modal event", event);
      store.commit("modal/SET_MODAL_TITLE", "setting title from home page", {
        root: true,
      });
      store.commit("modal/SET_MODAL_ACTIVE" as RootCommitType, true, {
        root: true,
      });
    },
  },
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
