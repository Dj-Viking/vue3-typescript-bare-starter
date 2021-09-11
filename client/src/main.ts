import { createApp, h, provide } from "vue";
import App from "./App.vue";
import BaseLayout from "./components/BaseLayout.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import {
  ApolloClient,
  ApolloLink,
  concat,
  createHttpLink,
  InMemoryCache,
} from "@apollo/client/core";
import { DefaultApolloClient } from "@vue/apollo-composable";

//init apollo cache
const cache = new InMemoryCache();

const authMiddleware = new ApolloLink((operation, next) => {
  // add the authorization to the headers
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      authorization: `Bearer ${localStorage.getItem("id_token") || null}`,
    },
  }));
  return next(operation);
});

// HTTP connection to the API
const httpLink = createHttpLink({
  // You should use an absolute URL here
  uri:
    process.env.NODE_ENV === "development"
      ? "http://localhost:4000/graphql"
      : "/graphql",
  headers: {
    authorization: `Bearer ${localStorage.getItem("id_token") || null}`,
  },
  credentials: "include",
});

// Create the apollo client
const apolloClient = new ApolloClient({
  link: concat(authMiddleware, httpLink),
  cache,
});

//create app
const app = createApp({
  setup() {
    provide(DefaultApolloClient, apolloClient);
    provide("$email", `${localStorage.getItem("global_email") || null}`);
  },
  render: () => h(App),
})
  .use(store)
  .use(router);

app.component("base-layout", BaseLayout);

router.isReady().then(() => {
  app.mount("#app");
});
