import "reflect-metadata";
import { DynamoDBClient, CreateTableCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import data from "../src/dummy";

const TABLE_NAME = process.env.TABLE_NAME;
if (!TABLE_NAME) throw new Error("TABLE_NAME env var is required");

const client = new DynamoDBClient({
  region: process.env.AWS_REGION ?? 'eu-central-1',
  endpoint: process.env.DYNAMODB_ENDPOINT,
});
const dynamo = DynamoDBDocumentClient.from(client);

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
    console.log(`Table ${TABLE_NAME} already exists`);
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

seed().catch(console.error);
