export interface Card {
  id: number;
  text: string;
  updatedAt: number;
  createdAt: number;
  color: string | "blue"; //TODO remove
}

export interface EditCardResponse {
  editCardById: {
    errors: MyErrorResponse;
    cards?: null | Card[];
  };
}
export interface Modal {
  context: {
    cardId: number;
  };
  activeClass: boolean;
  title: string;
}
export interface EditCardCommitPayload {
  text: string;
  id: number;
}
export interface EditCardModalContext {
  cardId: number;
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
// only applies to the cardlist component anyways
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
    cards: Card[];
  };
}
export interface GetUserCardsResponse {
  getUserCards: {
    cards: Card[];
    errors: MyErrorResponse;
  };
}
export interface MyRootState {
  user: UserState;
  cards: CardsState;
  modal: ModalState;
  notification: NotificationState;
}
export interface UserState {
  user: {
    username: string | null;
    email: string | null;
    token?: string | null | undefined;
    cards: Card[];
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
export interface CardsState {
  cards: Array<Card>;
}

export type RootDispatchType =
  | "user/setUserToken"
  | "user/setUserCards"
  | "user/setUser"
  | "cards/setCards"
  | "cards/deleteCard"
  | "cards/editCard"
  | "cards/addCard";

export interface AddCardPayload {
  options: {
    frontSideText: string | undefined;
    frontSideLanguage: string | undefined;
    frontSidePicture: string | undefined;
    backSideText: string | undefined;
    backSideLanguage: string | undefined;
    backSidePicture: string | undefined;
  };
}
export interface AddCardResponse {
  addCard: {
    cards: Card[];
    errors: MyErrorResponse;
  };
}

export type RootCommitType =
  | "user/SET_USER"
  | "user/CLEAR_USER_TOKEN"
  | "user/SET_LOGGED_IN"
  | "user/SET_USER_CARDS"
  | "cards/ADD_CARD"
  | "cards/SET_CARDS"
  | "cards/DELETE_CARD"
  | "cards/EDIT_CARD"
  | "modal/SET_MODAL_ACTIVE"
  | "modal/SET_MODAL_CONTEXT"
  | "notification/OPEN_NOTIFICATION"
  | "notification/CLOSE_NOTIFICATION";

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

export interface NotificationState {
  notification: {
    type: "error" | "success" | "";
    message: string;
    toastDown: boolean;
    toastUp: boolean;
  };
}

export interface OpenNotificationPayload {
  notification: {
    type: "error" | "success";
    message: string;
    toastDown: true;
    toastUp: false;
  };
}
