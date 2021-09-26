export interface Todo {
  id: number;
  text: string;
  updatedAt: number;
  createdAt: number;
  color: string | "blue";
}

export interface EditTodoResponse {
  editTodoById: {
    errors: MyErrorResponse;
    todos?: null | Todo[];
  };
}
export interface Modal {
  context: {
    todoId: number;
  };
  activeClass: boolean;
  title: string;
}
export interface EditTodoCommitPayload {
  text: string;
  id: number;
}
export interface EditTodoModalContext {
  todoId: number;
}
export interface ModalState {
  modal: Modal;
}
/**
 * ansi escape code enum collection for printing any color text into the console as the first/third argument of a console.log()
 * @example
 * console.log(`${red || "\x1b[31m"}`, "red text in the log", `${reset || "\x1b[00m"}`)
 */
export enum ANSI_ESCAPES {
  danger = "\x1b[31m",
  success = "\x1b[32m",
  info = "\x1b[36m",
  warning = "\x1b[33m",
  link = "\x1b[35m",
  danger_back = "\x1b[41m",
  success_back = "\x1b[42m",
  warning_back = "\x1b[43m",
  info_back = "\x1b[44m",
  link_back = "\x1b[45m",
  reset = "\x1b[00m",
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
export interface MeQueryResponse extends Object {
  me: {
    user: UserEntityBase;
    errors: MyErrorResponse;
    todos: Todo[];
  };
}
export interface GetUserTodosResponse {
  getUserTodos: {
    todos: Todo[];
    errors: MyErrorResponse;
  };
}
export interface MyRootState {
  user: UserState;
  todos: TodosState;
  modal: ModalState;
}
export interface UserState {
  user: {
    username: string | null;
    email: string | null;
    token?: string | null | undefined;
    todos: Todo[];
    loggedIn: boolean;
  };
}

export interface UserEntityBase {
  id?: number;
  username: string;
  email: string;
  token: string | null;
  createdAt: number;
  updatedAt: number;
}
export interface TodosState {
  todos: Array<Todo>;
}

export type RootDispatchType =
  | "user/setUserToken"
  | "user/setUserTodos"
  | "user/setUser"
  | "todos/setTodos"
  | "todos/deleteTodo"
  | "todos/editTodo"
  | "todos/addTodo";

export interface AddTodoResponse {
  addTodo: {
    todos: Todo[];
    errors: MyErrorResponse;
  };
}

export type RootCommitType =
  | "user/SET_USER"
  | "user/CLEAR_USER_TOKEN"
  | "user/SET_LOGGED_IN"
  | "user/SET_USER_TODOS"
  | "todos/ADD_TODO"
  | "todos/SET_TODOS"
  | "todos/DELETE_TODO"
  | "todos/EDIT_TODO"
  | "modal/SET_MODAL_ACTIVE"
  | "modal/SET_MODAL_CONTEXT";

export interface CustomError {
  field: string;
  message: string;
}
export type MyErrorResponse = CustomError[] | null;

export interface RegisterResponse {
  register: {
    errors: MyErrorResponse;
    token: string | null;
    user: UserEntityBase | null;
  };
}
export interface LoginResponse {
  login: {
    errors: MyErrorResponse;
    token: string | null;
    user: UserEntityBase | null;
  };
}
