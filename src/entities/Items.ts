import { Max, Min } from 'class-validator';
import { ObjectType, Field, ID, Int, Float, ArgsType } from 'type-graphql';
import { Authors } from './Authors';

@ObjectType("Items", { description: 'The Items model' })
export class Items {
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true })
  pic?: string;

  @Field(() => Authors)
  author: Authors;

  @Field(() => Float)
  views: number;

  @Field(() => String)
  title: string;

  @Field(() => String)
  price: string;

  @Field(() => Int)
  @Min(0)
  likes: number = 0;

  @Field(() => Float)
  @Min(0)
  comments: number = 0;

  @Field(() => Date)
  publishDate: Date;
}

@ArgsType()
export class GetItemsArgs {
  @Field(() => Int, { defaultValue: 365 })
  @Min(1)
  @Max(3650)
  range: number;

  @Field(() => Int, { defaultValue: 12 })
  @Min(1)
  @Max(100)
  limit: number;

  @Field(() => Int, { defaultValue: 0 })
  @Min(0)
  offset: number;
}

export const ItemsModel = Items;
