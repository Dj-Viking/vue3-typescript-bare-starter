
import { ANSI_ESCAPES, EditTodoPayload } from "../../types";

export function logJson(input: any): void {
  return (() => console.log(`${ANSI_ESCAPES.warning}`, `${JSON.stringify(input, null, 2)}`, `${ANSI_ESCAPES.reset}`))();
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
				this.color = ANSI_ESCAPES.warning;
			}
			break;
			case "red": {
				this.color = ANSI_ESCAPES.danger;
			}
			break;
			case "green": {
				this.color = ANSI_ESCAPES.success;
			}
			break;
			case "blue": {
				this.color = ANSI_ESCAPES.info;
			}
			break;
			case "purple": {
				this.color = ANSI_ESCAPES.link;
			}
			break;
			default: this.color = "";
			
		}
	}
	public genLog(): void {
		return console.log(`${this.color}`, `${this.message}`, `${ANSI_ESCAPES.reset}`);
	}
}

export function createAddTodoMutation(email: string): string {
  return `
		mutation addTodo {
			addTodo(options: {
				text: "some text",
				email: "${email}"
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

export function createGetUserTodosQuery(email: string): string {
  return `
		{
			getUserTodos(
				email: "${email}"
			){
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

export function createClearUserTodosMutation(email: string): string {
  return `
		mutation clearUserTodos {
			clearUserTodos( 
				email: "${email}"
			){
				errors {
					field
					message
				}
				done
			}
		}
	`
}

export function createEditTodoMutation(payload: EditTodoPayload): string {
  const { text, todoId, email } = payload
  return `
		mutation editTodoById{
			editTodoById(options: {
				text: "${text}",
				email: "${email}",
				todoId: ${todoId}
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

export function createMeQuery(email: string): string {
	return `
		{
			me(
				email: "${email}"
			){
				user {
					token
					id
					username
					email
					createdAt
					updatedAt
				}
				token
				errors {
					field
					message
				}
			}
		}
	`
}