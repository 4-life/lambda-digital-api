import { ObjectType, Field, ID } from 'type-graphql';

@ObjectType({ description: 'The Authors model' })
export class Authors {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: String;

  @Field(() => String, { nullable: true })
  avatar?: String;
}

export const AuthorsModel = Authors;
