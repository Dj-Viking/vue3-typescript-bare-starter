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

export function createAddCardMutation(): string {
  return `
    mutation addCard($text: String!) {
      addCard(text: $text) {
        cards {
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
        cards {
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

export function createEditCardMutation(): string {
  return `
    mutation editCardById($id: Int!, $text: String!){
      editCardById(id: $id, text: $text) {
        errors{
          field
          message
        }
        cards {
          id
          text
          updatedAt
          createdAt
        }
      }
    }
  `;
}

export function createClearUserCardsMutation(): string {
  return `
    mutation clearUserCards {
      clearUserCards {
        done
        errors {
          field
          message
        }
      }
    }
  `;
}

export function createDeleteCardMutation(): string {
  return `
    mutation deleteCard($id: Int!) {
      deleteCard(id: $id){
        cards {
          id
          text
        }
        errors {
          field
          message
        }
      }
    }
  `;
}
