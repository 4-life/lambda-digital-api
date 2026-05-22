import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export const dynamo = DynamoDBDocumentClient.from(
  new DynamoDBClient({ endpoint: process.env.DYNAMODB_ENDPOINT })
);
export const TABLE_NAME = process.env.TABLE_NAME!;
