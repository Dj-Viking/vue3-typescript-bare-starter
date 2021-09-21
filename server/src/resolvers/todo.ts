import { Todo } from '../entities/Todo';
import { User } from '../entities/User';
import { 
  Resolver, 
  Query, 
  Mutation,
  // ObjectType,
  Field,
  InputType,
  Arg,
  ObjectType,
  Ctx
} from 'type-graphql';
import { getConnection } from 'typeorm';
import { ANSI_ESCAPES, MyContext } from '../types';
import { ErrorResponse } from '../utils/ErrorResponse';

@ObjectType()
class TodoError {
  @Field()
  field: String;
  @Field()
  message: String; 
}

@InputType()
class AddTodoInput {
  @Field()
  text: string;
  @Field()
  email: string;
}
@InputType()
class EditTodoInput {
  @Field()
  text: string;
  @Field()
  todoId: number;
  @Field()
  email: string;
}

@ObjectType()
class ClearTodoResponse {
  @Field(() => [TodoError], { nullable: true })
  errors?: TodoError[] | null

  @Field(() => Boolean, { nullable: true })
  done: boolean | null;
}
@ObjectType()
class AddTodoResponse {
  @Field(() => [TodoError], { nullable: true })
  errors?: TodoError[] | null

  @Field(() => [Todo], { nullable: true })
  todos?: Todo[] | null
}
@ObjectType()
class EditTodoResponse {
  @Field(() => [TodoError], { nullable: true })
  errors?: TodoError[] | null

  @Field(() => Todo, { nullable: true })
  todo?: Todo | null
}
@ObjectType()
class GetUserTodosResponse {
  @Field(() => [TodoError], { nullable: true })
  errors?: TodoError[] | null

  @Field(() => [Todo], { nullable: true })
  todos?: Todo[] | null
}

// @ObjectType()
// class TodoAddResponse {
//   @Field(() => Todo, {nullable: true})
//   todos: Todo[]
// }
@Resolver()
export class TodoResolver {

  @Query(() => String)
  async helloTodo(): Promise<string>{
    return "hello TODO"
  }

  @Query(() => GetUserTodosResponse)
  async getUserTodos(
    @Arg("email", () => String) email: string,
    @Ctx() { req }: MyContext
  ): Promise<GetUserTodosResponse> {
    /// if requestor is not authorized to get the todos with their requestor ID not authorized
  if (!req.user) {
    return new ErrorResponse("unauthenticated", "401 Unauthenticated");
  }
  console.log("req checking req.user", req.user);
  
  //get the requestors email and compare with the creatorId owner's email (emails are unique)
  const foundUserByEmail = await User.findOne({ where: { email } });
  if (!foundUserByEmail) {
    return new ErrorResponse("not found", "404 Not Found");
  }

  //does the creator Id match that of the requestor's? 
  if (foundUserByEmail?.email !== req.user.email) {
    return new ErrorResponse("forbidden", "403 Forbidden");
  }

    try {
      const todos = await Todo.find({ where: { creatorId: foundUserByEmail.id }});
      console.log("checking todos given the creatorId", todos);
      return {
        todos: todos
      };
    } catch (error) {
      return new ErrorResponse("error", error.message)
    }
  }

  @Mutation(() => EditTodoResponse)
  async editTodoById(
    @Arg("options", () => EditTodoInput) options: EditTodoInput,
    @Ctx() { req }: MyContext
  ): Promise<EditTodoResponse> {

    if (!req.user) {
      return new ErrorResponse("unauthenticated", "401 Unauthenticated");
    }
    console.log("req checking req.user", req.user);
    
    //get the requestors email and compare with the creatorId owner's email (emails are unique)
    const foundUserByEmail = await User.findOne({ where: { email: options.email } });
    if (!foundUserByEmail) {
      return new ErrorResponse("not found", "404 Not Found");
    }
  
    //does the editor's email match that of the requestor's email? 
    if (foundUserByEmail?.email !== req.user.email) {
      return new ErrorResponse("forbidden", "403 Forbidden");
    }

    try {
      const changedTodo = await getConnection()
        .getRepository(Todo)
        .createQueryBuilder("todo")
        .update<Todo>(Todo, 
                      { text: options.text })
        .where("id = :id", { id: options.todoId })
        .returning(["text", "id", "creatorId", "createdAt", "updatedAt"])
        .updateEntity(true)
        .execute();
      if (!changedTodo.raw[0]) return new ErrorResponse("todo", "404 Todo Not Found");

      console.log('changed todo', changedTodo.raw[0]);

      return {
        todo: changedTodo.raw[0]
      }
      
    } catch (error) {
      return new ErrorResponse("error when editing a todo", error);
    }
  }

  @Mutation(() => ClearTodoResponse)
  async clearUserTodos(
    @Arg("email", () => String) email: string,
    @Ctx() { req }: MyContext
  ): Promise<ClearTodoResponse | ErrorResponse> {

    //cant delete if not authorized or even the user who is logged in trying to complete this operation
    if (!req.user) return new ErrorResponse("unauthorized", "401 unauthorized or expired token");
    
    console.log("req.user", req.user);

    //the requestor is not the owner of the todos using email since emails are unique per user
    // and the requestor is embedded into the jwt information
    const foundUserByEmail = await User.findOne({ where: { email }});

    //if no user RETURN error not throw, this is for testing the correct responses
    // because graphql will only return 200's for most everything even if the request is formatted correctly
    // we are checking for data integrity and user honesty
    if (!foundUserByEmail) return new ErrorResponse("not found", "404 Not Found");

    //if user was found with email in request but does not match the requestor's email
    if (req.user?.email !== foundUserByEmail.email) return new ErrorResponse("forbidden", "403 Forbidden");

    try {
      //get all todos by the requestor's id that we found by the email input
      const todosToDelete = await Todo.find({ where: { creatorId: foundUserByEmail.id }});
      const deletePromises = todosToDelete.map(async (todo: Todo) => {
        return Todo.delete(todo.id);
      });
      await Promise.all(deletePromises);
      return {
        done: true
      }
    } catch (error) {
      return new ErrorResponse("error", error.message);
    }
  }

  @Mutation(() => AddTodoResponse)
  async addTodo(
    @Arg("options", () => AddTodoInput) options: AddTodoInput,
    @Ctx() { req }: MyContext
  ): Promise<AddTodoResponse> {
    // TODO abstract these checks to a middlware ... learn that first
    console.log("checking context user", req.user);
    if (!req.user) {
      return new ErrorResponse("unauthenticated", "401 user not authenticated");
    }
    const foundUserByEmail: User | undefined = await User.findOne({ where: { email: options.email }});
    if (!foundUserByEmail) 
      return new ErrorResponse("not found", "404 Not Found");

    if (foundUserByEmail.email !== req.user.email)
      return new ErrorResponse("forbidden", "403 Forbidden");

    try {
      await getConnection()
      .createQueryBuilder()
      .insert()
      .into(Todo)
      .values({ text: options.text,
                //a creator with this id MUST exist for this query to work!!
                creatorId: foundUserByEmail?.id })
      .returning('*')
      .execute();
      //seeing all the todos that the user has
      const todos = await Todo.find({ where: { creatorId: foundUserByEmail?.id } });
      console.log(`${ANSI_ESCAPES.success}`, `Someone added a todo!`, `${ANSI_ESCAPES.reset}`)
      return {
        todos: todos
      };
    } catch (error) {
      return new ErrorResponse("error", error.message)
    }
    
  }
  
}