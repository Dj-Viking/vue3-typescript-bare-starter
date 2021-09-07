import { Todo } from '../entities/Todo';
// import { User } from '../entities/User';
import { 
  Resolver, 
  Query, 
  Mutation,
  // ObjectType,
  Field,
  InputType,
  Arg,
  Int,
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
  creatorId: number;
}
@InputType()
class EditTodoInput {
  @Field()
  text: string;
  @Field()
  id: number;
}

@ObjectType()
class ClearTodoResponse {
  @Field(() => [TodoError], { nullable: true })
  errors?: TodoError[] | null

  @Field(() => Boolean, { nullable: true })
  done: boolean;
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
    @Arg("creatorId", () => Int) creatorId: number
  ): Promise<GetUserTodosResponse> {
    try {
      const todos = await Todo.find({ where: { creatorId }});
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
    @Arg("options", () => EditTodoInput) options: EditTodoInput
  ): Promise<EditTodoResponse> {
    try {
      const changedTodo = await getConnection()
        .getRepository(Todo)
        .createQueryBuilder("todo")
        .update<Todo>(Todo, 
                      { text: options.text })
                                    .where("id = :id", { id: options.id })
                                    .returning(["text", "id", "creatorId"])
                                    .updateEntity(true)
                                    .execute();
      if (!changedTodo.raw[0]) return new ErrorResponse("todo", "todo not found");

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
    @Arg("creatorId", () => Int) creatorId: number
  ): Promise<ClearTodoResponse | ErrorResponse> {
    try {
      //get all todos by the user's creatorId
      const todosToDelete = await Todo.find({ where: { creatorId }});
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
    try {
      console.log("checking context user", req.user);
      if (!req.user) {
        throw new Error("user not authenticated");
      }
      await getConnection()
      .createQueryBuilder()
      .insert()
      .into(Todo)
      .values({ text: options.text,
                //a creator with this id MUST exist for this query to work!!
                creatorId: options.creatorId })
                                              .returning('*')
                                              .execute();
      const todos = await Todo.find();
      console.log(`${ANSI_ESCAPES.green}`, `Someone added a todo!`, `${ANSI_ESCAPES.reset}`)
      return {
        todos: todos
      };
    } catch (error) {
      return new ErrorResponse("error", error.message)
    }
    
  }
  
}