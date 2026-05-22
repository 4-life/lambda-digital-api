import { Resolver, Arg, Query, Args } from 'type-graphql';
import { GraphQLError } from 'graphql';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { GetItemsArgs, Items } from '../entities/Items';
import { dynamo, TABLE_NAME, scanAllItems } from '../db';

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
  async items(@Args(() => GetItemsArgs) { range, limit, offset }: GetItemsArgs): Promise<Items[]> {
    const cutoff = new Date(Date.now() - range * 24 * 60 * 60 * 1000).toISOString();
    const all = await scanAllItems();

    return all
      .filter((raw) => (raw.publishDate as string) >= cutoff)
      .map(toItem)
      .sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime())
      .slice(offset, offset + limit);
  }
}
