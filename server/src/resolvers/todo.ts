import { Todo } from '../entities/Todo';
import { 
  Resolver, 
  Query, 
  Mutation,
  // ObjectType,
  Field,
  InputType,
  Arg
} from 'type-graphql';
import { getConnection } from 'typeorm';
import { ANSI_ESCAPES } from '../types';

// @ObjectType()
// class TodoError {
//   @Field()
//   field: String;
//   @Field()
//   message: String; 
// }

@InputType()
class AddTodoInput {
  @Field()
  text: string;
  @Field()
  creatorId: number;
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

  @Mutation(() => [Todo])
  async addTodo(
    @Arg("options", () => AddTodoInput) options: AddTodoInput
  ): Promise<Todo[]> {
    await getConnection()
    .createQueryBuilder()
    .insert()
    .into(Todo)
    .values(
      {
        text: options.text,
        //a creator with this id MUST exist for this query to work!!
        creatorId: options.creatorId,
      }
    )
    .returning('*')
    .execute();
    const todos = await Todo.find();
    console.log(`${ANSI_ESCAPES.green}`, `Someone added a todo!`, `${ANSI_ESCAPES.reset}`)
    return todos;
  }
  
}