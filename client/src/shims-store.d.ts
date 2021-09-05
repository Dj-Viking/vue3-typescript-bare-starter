declare module "*.store.ts" {
  import { createStore } from "vuex";
  export default typeof createStore;
}
