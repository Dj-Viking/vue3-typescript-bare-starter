

import { ANSI_ESCAPES, EditCardPayload } from "../../types";

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

export function createLogoutMutation(email: string): string {
	return `
		mutation logout{
			logout(email: "${email}") {
				done
				errors {
					field
					message
				}
			}
		}
	`
}

export function createAddCardMutation(text: string): string {
  return `
		mutation addCard {
			addCard(text: "${text}") {
				cards {
					id
					text
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
	`;
}

export function createGetUserCardsQuery(): string {
  return `
		query getUserCards {
			getUserCards{
				cards {
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

export function createClearUserCardsMutation(): string {
  return `
		mutation clearUserCards {
			clearUserCards {
				errors {
					field
					message
				}
				done
			}
		}
	`
}

export function createEditCardMutation(payload: EditCardPayload): string {
  const { text, cardId } = payload
  return `
		mutation editCardById {
			editCardById(id: ${cardId}, text: "${text}"){
				errors {
					field
					message
				}
				cards {
					text
					creatorId
					id
				}
			}
		}
	`;
}

export function createMeQuery(): string {
	return `
		{
			me {
				user {
					token
					id
					username
					email
					createdAt
					updatedAt
				}
				cards {
					id
					text
					updatedAt
					createdAt
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