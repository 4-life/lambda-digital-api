import "reflect-metadata";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import data from "../src/dummy";

const TABLE_NAME = process.env.TABLE_NAME;
if (!TABLE_NAME) throw new Error("TABLE_NAME env var is required");

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));

async function seed() {
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
