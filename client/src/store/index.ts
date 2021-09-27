import { createStore, ModuleTree, Store } from "vuex";

import user from "./user.store";
import modal from "./modal.store";
import notification from "./notification.store";
import todos from "./todos.store";
import { MyRootState } from "@/types";

const store: Store<MyRootState> = createStore({
  modules: {
    todos,
    modal,
    notification,
    user,
  } as ModuleTree<MyRootState>,
});

export default store as Store<MyRootState>;
