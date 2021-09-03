import { createStore, ModuleTree } from "vuex";

import user from "./user.store";
import todos from "./todos.store";
import { MyRootState } from "@/types";

const store = createStore({
  modules: {
    todos,
    user,
  } as ModuleTree<MyRootState>,
});

export default store;
