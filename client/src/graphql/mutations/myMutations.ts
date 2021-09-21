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
        errors {
          field
          message
        }
      }
    }
  `;
}
