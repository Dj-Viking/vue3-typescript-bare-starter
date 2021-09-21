export function createMeQuery(): string {
  return `
    query me {
      me {
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
  `;
}
