/// <reference types="mocha" />
import 'reflect-metadata';
import { expect } from 'chai';
import { DynamoDBClient, CreateTableCommand, DeleteTableCommand, ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { ApolloServer } from '@apollo/server';
import { createServer } from '../index';

const TABLE = process.env.TABLE_NAME ?? 'items-test';

const ddbClient = new DynamoDBClient({ endpoint: 'http://localhost:8000' });
const ddb = DynamoDBDocumentClient.from(ddbClient);

const RECENT_ID = 'test-recent-1';
const OLD_ID = 'test-old-1';

const RECENT_ITEM = {
  id: RECENT_ID,
  title: '#42 Neon City',
  author: { id: 'author-1', name: 'Alice', avatar: '01.webp' },
  pic: 'test1.webp',
  views: 1234,
  likes: 56,
  comments: 7,
  price: '0.500',
  publishDate: new Date().toISOString(),
};

const OLD_ITEM = {
  id: OLD_ID,
  title: '#1 Ancient NFT',
  author: { id: 'author-2', name: 'Bob', avatar: '02.webp' },
  pic: 'test2.webp',
  views: 999,
  likes: 88,
  comments: 12,
  price: '1.200',
  publishDate: new Date(Date.now() - 800 * 24 * 60 * 60 * 1000).toISOString(),
};

async function waitForDynamo(retries = 20, intervalMs = 300) {
  for (let i = 0; i < retries; i++) {
    try {
      await ddbClient.send(new ListTablesCommand({}));
      return;
    } catch {
      await new Promise(r => setTimeout(r, intervalMs));
    }
  }
  throw new Error('DynamoDB Local did not become ready in time');
}

let server: ApolloServer;

async function execute(query: string, variables?: Record<string, unknown>) {
  const result = await server.executeOperation({ query, variables });
  if (result.body.kind !== 'single') throw new Error('Expected single result');
  return result.body.singleResult;
}

before(async function () {
  this.timeout(15_000);

  await waitForDynamo();
  await ddbClient.send(new CreateTableCommand({
    TableName: TABLE,
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    BillingMode: 'PAY_PER_REQUEST',
  }));

  await Promise.all([
    ddb.send(new PutCommand({ TableName: TABLE, Item: RECENT_ITEM })),
    ddb.send(new PutCommand({ TableName: TABLE, Item: OLD_ITEM })),
  ]);

  server = await createServer();
  await server.start();
});

after(async () => {
  await server?.stop();
  await ddbClient.send(new DeleteTableCommand({ TableName: TABLE }));
});

describe('status', () => {
  it('returns true', async () => {
    const { data, errors } = await execute('query { status }');
    expect(errors).to.be.undefined;
    expect(data?.status).to.be.true;
  });
});

describe('items', () => {
  it('excludes items outside the date range', async () => {
    const { data, errors } = await execute(
      'query ($range: Int) { items(range: $range) { id } }',
      { range: 365 },
    );
    expect(errors).to.be.undefined;
    const ids = (data?.items as any[]).map((i: any) => i.id);
    expect(ids).to.include(RECENT_ID);
    expect(ids).to.not.include(OLD_ID);
  });

  it('includes all items with a large range', async () => {
    const { data, errors } = await execute(
      'query ($range: Int) { items(range: $range) { id } }',
      { range: 3650 },
    );
    expect(errors).to.be.undefined;
    const ids = (data?.items as any[]).map((i: any) => i.id);
    expect(ids).to.include(RECENT_ID);
    expect(ids).to.include(OLD_ID);
  });

  it('returns items sorted by publishDate descending', async () => {
    const { data } = await execute(
      'query { items(range: 3650) { publishDate } }',
    );
    const dates = (data?.items as any[]).map((i: any) => new Date(i.publishDate).getTime());
    expect(dates).to.deep.equal([...dates].sort((a, b) => b - a));
  });

  it('returns all expected fields with correct types', async () => {
    const { data, errors } = await execute(
      'query { items(range: 365) { id title pic views likes comments price author { id name avatar } } }',
    );
    expect(errors).to.be.undefined;
    const item = (data?.items as any[])[0];
    expect(item.id).to.be.a('string');
    expect(item.title).to.be.a('string');
    expect(item.pic).to.be.a('string');
    expect(item.views).to.be.a('number');
    expect(item.likes).to.be.a('number');
    expect(item.comments).to.be.a('number');
    expect(item.price).to.match(/^\d+\.\d+$/);
    expect(item.author.id).to.be.a('string');
    expect(item.author.name).to.be.a('string');
    expect(item.author.avatar).to.be.a('string');
  });
});

describe('item', () => {
  it('returns the correct item by id', async () => {
    const { data, errors } = await execute(
      'query ($id: String!) { item(id: $id) { id title price author { name } } }',
      { id: RECENT_ID },
    );
    const item = data?.item as any;
    expect(errors).to.be.undefined;
    expect(item?.id).to.equal(RECENT_ID);
    expect(item?.title).to.equal(RECENT_ITEM.title);
    expect(item?.price).to.equal(RECENT_ITEM.price);
    expect(item?.author?.name).to.equal(RECENT_ITEM.author.name);
  });

  it('returns BAD_USER_INPUT error for unknown id', async () => {
    const { errors } = await execute(
      'query ($id: String!) { item(id: $id) { id } }',
      { id: 'nonexistent-id' },
    );
    expect(errors).to.have.length(1);
    expect(errors![0].extensions?.code).to.equal('BAD_USER_INPUT');
  });
});
