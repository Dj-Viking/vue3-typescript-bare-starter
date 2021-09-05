
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  BaseEntity,
  ManyToOne
} from 'typeorm';
import { ObjectType, Field, Int } from 'type-graphql';
import { User } from './User';

//this is now both an object type and an entity
@ObjectType()
@Entity()
export class Todo extends BaseEntity {

  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;
  
  @Field()
  @Column()
  creatorId: number;

  @Field()
  @Column()
  title!: string;

  @Field()
  @Column()
  text!: string;

  @Field()
  @Column({ type: "int", default: 0 })
  points!: number;

  //not exposing the creator here
  @ManyToOne(() => User, user => user.todos)
  creator: User;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

}