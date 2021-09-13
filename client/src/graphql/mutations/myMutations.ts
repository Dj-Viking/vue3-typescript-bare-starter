export function createRegisterMutation(): string {
  return `
    mutation register($options: RegisterInput!) {
      register(options: $options){
        token
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

export function createLoginMutation(): string {
  return `
    mutation login($options: LoginInput!) {
      login(options: $options) {
        token
        user {
          email
          username
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
