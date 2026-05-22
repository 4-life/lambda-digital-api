
import 'source-map-support/register';
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateLambdaHandler, handlers } from '@as-integrations/aws-lambda';
import "reflect-metadata";
import { buildSchema } from 'type-graphql';
import { ItemsResolver } from './src/resolvers/Items';
import { StatusResolver } from './src/resolvers/Status';

const emitSchemaFile = !!process.env.GENERATE_SCHEMA;

export async function createServer() {
  const schema = await buildSchema({
    resolvers: [ItemsResolver, StatusResolver],
    emitSchemaFile,
  });
  return new ApolloServer({ schema });
}

async function createLambdaHandler() {
  const server = await createServer();
  return startServerAndCreateLambdaHandler(
    server,
    handlers.createAPIGatewayProxyEventV2RequestHandler(),
  );
}

let handlerPromise: ReturnType<typeof createLambdaHandler> | undefined;

export const handler = async (event: any, context: any, callback: any) => {
  if (!handlerPromise) {
    handlerPromise = createLambdaHandler();
  }
  return (await handlerPromise)(event, context, callback);
};
