import "reflect-metadata";
import { DynamoDBClient, CreateTableCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand, BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
import data from "../src/dummy";

function resolveTableName(): string {
  if (process.env.TABLE_NAME) return process.env.TABLE_NAME;
  try {
    const { Resource } = require("sst");
    return Resource.ItemsTable.name;
  } catch {
    throw new Error("TABLE_NAME env var is required (or run via `sst shell`)");
  }
}

const TABLE_NAME = resolveTableName();

const client = new DynamoDBClient({
  region: process.env.AWS_REGION ?? 'eu-central-1',
  endpoint: process.env.DYNAMODB_ENDPOINT,
});
const dynamo = DynamoDBDocumentClient.from(client);

async function clearTable() {
  let lastEvaluatedKey: Record<string, any> | undefined;
  do {
    const result = await dynamo.send(new ScanCommand({
      TableName: TABLE_NAME,
      ProjectionExpression: 'id',
      ExclusiveStartKey: lastEvaluatedKey,
    }));
    const items = result.Items ?? [];
    for (let i = 0; i < items.length; i += 25) {
      const batch = items.slice(i, i + 25);
      await dynamo.send(new BatchWriteCommand({
        RequestItems: {
          [TABLE_NAME]: batch.map(item => ({ DeleteRequest: { Key: { id: item.id } } })),
        },
      }));
    }
    lastEvaluatedKey = result.LastEvaluatedKey;
  } while (lastEvaluatedKey);
  console.log(`Cleared existing items from ${TABLE_NAME}`);
}

async function seed() {
  try {
    await client.send(new CreateTableCommand({
      TableName: TABLE_NAME,
      AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
      KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
      BillingMode: 'PAY_PER_REQUEST',
    }));
    console.log(`Created table ${TABLE_NAME}`);
  } catch (e: any) {
    if (e.name !== 'ResourceInUseException') throw e;
    await clearTable();
  }

  await Promise.all(
    data.map(item =>
      dynamo.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: { ...item, publishDate: item.publishDate.toISOString() },
      }))
    )
  );
  console.log(`Seeded ${data.length} items into ${TABLE_NAME}`);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
