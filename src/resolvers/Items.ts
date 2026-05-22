import { Resolver, Arg, Query, Args } from 'type-graphql';
import { GraphQLError } from 'graphql';
import { GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { GetItemsArgs, Items } from '../entities/Items';
import { dynamo, TABLE_NAME } from '../db';

const toItem = (raw: Record<string, unknown>): Items => ({
  ...(raw as unknown as Items),
  publishDate: new Date(raw.publishDate as string),
});

@Resolver()
export class ItemsResolver {
  @Query(() => Items, { nullable: false })
  async item(@Arg('id', () => String) id: string): Promise<Items> {
    const result = await dynamo.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { id },
    }));
    if (!result.Item) {
      throw new GraphQLError(`Item with id ${id} not found`, {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }
    return toItem(result.Item);
  }

  @Query(() => [Items])
  async items(@Args() { range }: GetItemsArgs): Promise<Items[]> {
    const cutoff = new Date(Date.now() - range * 24 * 60 * 60 * 1000).toISOString();
    const result = await dynamo.send(new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'publishDate >= :cutoff',
      ExpressionAttributeValues: { ':cutoff': cutoff },
    }));
    return (result.Items ?? [])
      .map(toItem)
      .sort((a: Items, b: Items) => b.publishDate.getTime() - a.publishDate.getTime());
  }
}
