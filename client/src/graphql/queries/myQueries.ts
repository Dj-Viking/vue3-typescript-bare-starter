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
      }
    }
  `;
}
