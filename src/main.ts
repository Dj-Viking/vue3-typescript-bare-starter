import { createApp } from "vue";
import App from "./App.vue";
import BaseLayout from "./components/BaseLayout.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";

const app = createApp(App).use(store).use(router);
app.component("base-layout", BaseLayout);
router.isReady().then(() => {
  app.mount("#app");
});
