
import { ANSI_ESCAPES, EditTodoPayload } from "../../types";

export function logJson(input: any): void {
  return (() => console.log(`${ANSI_ESCAPES.yellow}`, `${JSON.stringify(input, null, 2)}`, `${ANSI_ESCAPES.reset}`))();
};

/**
 * helper class to construct colored console logs for the tests
 */
export class ColorLog extends Object {
	private color!: string;
	private message!: string;
	constructor(color: string, message: string) {
		super();
		this.message = message;
		switch (color) {
			case "yellow": {
				this.color = ANSI_ESCAPES.yellow;
			}
			break;
			case "red": {
				this.color = ANSI_ESCAPES.red;
			}
			break;
			case "green": {
				this.color = ANSI_ESCAPES.green;
			}
			break;
			case "blue": {
				this.color = ANSI_ESCAPES.blue;
			}
			break;
			case "purple": {
				this.color = ANSI_ESCAPES.purple;
			}
			break;
			default: this.color = "";
			
		}
	}
	public genLog(): void {
		return console.log(`${this.color}`, `${this.message}`, `${ANSI_ESCAPES.reset}`);
	}
}

export function createAddTodoMutation(creatorId: number): string {
  return `
		mutation addTodo {
			addTodo(options: {
				text: "some text",
				creatorId: ${creatorId as number}
			}){
				todos {
					text
					id
					createdAt
					updatedAt
					creatorId
				}
				errors {
					field
					message
				}
			}
		}
	`
}

export function createGetUserTodosQuery(creatorId: number): string {
  return `
		{
			getUserTodos(creatorId: ${creatorId}){
				todos {
					id
					creatorId
					text
					createdAt
					updatedAt
				}
				errors {
					field
					message
				}
			}
		}
	`
}

export function createClearUserTodosMutation(creatorId: number): string {
  return `
		mutation clearUserTodos {
			clearUserTodos(creatorId: ${creatorId}){
				done
			}
		}
	`
}

export function createEditTodoMutation(payload: EditTodoPayload): string {
  const { text, id } = payload
  return `
		mutation editTodoById{
			editTodoById(options: {
				text: "${text}",
				id: ${id}
			}){
				errors {
					field
					message
				}
				todo {
					text
					creatorId
					id
				}
			}
		}
	`;
}