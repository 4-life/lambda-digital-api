import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

export const dynamo = DynamoDBDocumentClient.from(
  new DynamoDBClient({ endpoint: process.env.DYNAMODB_ENDPOINT })
);
export const TABLE_NAME = process.env.TABLE_NAME!;

const CACHE_TTL_MS = 5 * 60 * 1000;

let cachedItems: Record<string, unknown>[] | null = null;
let cacheExpiresAt = 0;

export async function scanAllItems(): Promise<Record<string, unknown>[]> {
  if (cachedItems && Date.now() < cacheExpiresAt) return cachedItems;

  const all: Record<string, unknown>[] = [];
  let lastKey: Record<string, unknown> | undefined;

  do {
    const result = await dynamo.send(new ScanCommand({
      TableName: TABLE_NAME,
      ExclusiveStartKey: lastKey,
    }));
    all.push(...(result.Items ?? []));
    lastKey = result.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (lastKey);

  cachedItems = all;
  cacheExpiresAt = Date.now() + CACHE_TTL_MS;
  return all;
}
