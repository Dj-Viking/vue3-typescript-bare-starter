import { createStore, ModuleTree, Store } from "vuex";

import user from "./user.store";
import todos from "./todos.store";
import { MyRootState } from "@/types";

const store: Store<MyRootState> = createStore({
  modules: {
    todos,
    user,
  } as ModuleTree<MyRootState>,
});

export default store as Store<MyRootState>;
