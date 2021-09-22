export function createMeQuery(): string {
  return `
    query me {
      me {
        user {
          id
          username
          email
          token
        }
        errors {
          field
          message
        }
        todos {
          id
          text
          creatorId
        }
      }
    }
  `;
}

export function createGetUserTodosQuery(): string {
  return `
    query getUserTodos {
      getUserTodos {
        todos {
          text
          id
          creatorId
          createdAt
          updatedAt
        }
        errors{
          field
          message
        }
      }
    }
  `;
}
