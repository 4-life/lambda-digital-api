import 'reflect-metadata';
import { startStandaloneServer } from '@apollo/server/standalone';
import { createServer } from '../index';

const PORT = 3005;

async function main() {
  const server = await createServer();
  const { url } = await startStandaloneServer(server, {
    listen: { port: PORT },
  });
  console.log(`GraphQL server running at ${url}`);
}

main().catch(console.error);
