
import { ANSI_ESCAPES, EditTodoPayload } from "../../types";

export function logJson(input: any): void {
  return (() => console.log(`${ANSI_ESCAPES.yellow}`, `${JSON.stringify(input, null, 2)}`, `${ANSI_ESCAPES.reset}`))();
};

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