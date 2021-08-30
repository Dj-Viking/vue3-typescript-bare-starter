export interface Todo {
  id: number;
  text: string;
  color: string | "blue";
}

export interface MyDOMInputEvent extends Event {
  target: EventTarget & {
    //for some reason value isn't a property on the vanilla EventTarget type given by typescript....
    // so we are forcing it to be a property
    value: number | string;
  };
}
