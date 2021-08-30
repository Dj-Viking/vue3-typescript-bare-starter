export interface Todo {
  id: number;
  text: string;
  color: string | "blue";
}

//for some reason this interface for the event didn't export for whatever reason....strange...oh well it
// only applies to the todolist component anyways
export interface MyDOMInputEvent extends Event {
  target: EventTarget & {
    //for some reason value isn't a property on the vanilla EventTarget type given by typescript....
    // so we are forcing it to be a property
    value: number | string;
  };
}

export interface MyRootState {
  user: UserState;
  todos: TodosState;
}
export interface UserState {
  username: string | null;
  email: string | null;
  token: string | null;
  todos: Todo[];
}
export interface TodosState {
  todos: Array<Todo>;
}

export type RootDispatchTypes =
  | "user/setUserToken"
  | "user/setUserTodos"
  | "user/setUser"
  | "todos/setTodos";
