export function createRegisterMutation(): string {
  return `
    mutation register($options: RegisterInput!) {
      register(options: $options){
        token
        user {
          username
          email
          token
        }
        errors {
          field
          message
        }
      }
    }
  
  `;
}

export function createAddTodoMutation(): string {
  return `
    mutation addTodo($text: String!) {
      addTodo(text: $text) {
        todos {
          id
          creatorId
          createdAt
          text
          updatedAt
        }
        errors {
          field
          message
        }
      }
    }
  `;
}

export function createLoginMutation(): string {
  return `
    mutation login($options: LoginInput!) {
      login(options: $options) {
        token
        user {
          id
          email
          username
          token
        }
        todos {
          id
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
  `;
}

export function createLogoutMutation(email: string): string {
  return `
    mutation logout($email: String!) {
      logout(email: "${email}") {
        done
        errors {
          field
          message
        }
      }
    }
  `;
}
