# NFT Marketplace GraphQL API [![Deploy status](https://github.com/4-life/lambda-digital-api/actions/workflows/main.yml/badge.svg)](https://github.com/4-life/lambda-digital-api/actions)

![Apollo&nbsp;GraphQL](https://img.shields.io/badge/-Apollo%20GraphQL%204-333333?style=flat-square&logo=apollographql)
![SST](https://img.shields.io/badge/-SST%20v3-333333?style=flat-square&logo=amazondynamodb)
![AWS&nbsp;Lambda](https://img.shields.io/badge/-AWS%20Lambda-333333?style=flat-square&logo=awslambda)
![DynamoDB](https://img.shields.io/badge/-DynamoDB-333333?style=flat-square&logo=amazondynamodb)
![TypeScript](https://img.shields.io/badge/-TypeScript-333333?style=flat-square&logo=typescript)

GraphQL API for the NFT marketplace, running on AWS Lambda + API Gateway V2, backed by DynamoDB. Deployed with [SST v3](https://sst.dev).

## Stack

- **Apollo Server v4** — GraphQL server
- **type-graphql v2** — schema-first with decorators
- **AWS Lambda** — Node 22 runtime
- **API Gateway V2** — HTTP API with CORS
- **DynamoDB** — items storage
- **SST v3** — infrastructure as code

## Prerequisites

- Node.js 22+
- AWS CLI configured (`aws configure`)
- Docker (for local DynamoDB in tests)

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Live Lambda dev via `sst dev` — runs your code locally, traffic proxied from AWS |
| `npm run deploy-prod` | Deploy to `production` stage |
| `npm run seed` | Seed DynamoDB with sample NFT data (requires `TABLE_NAME` env var) |
| `npm run test:local` | Run tests locally — starts DynamoDB Local via Docker automatically |
| `npm test` | Run tests (requires DynamoDB Local running on port 8000) |

## Getting started

```bash
npm install
npx sst install     # generate SST type definitions

npm run deploy-dev  # deploy to AWS (prints the API URL on completion)
```

After deploying, seed the table:

```bash
TABLE_NAME=<name-from-deploy-output> npm run seed
```

## Local development

```bash
npm run dev
```

SST proxies live AWS traffic to your local machine — no emulation, real Lambda invocations hit your local code. The DynamoDB table is the deployed one.

## Testing

```bash
npm run test:local  # starts DynamoDB Local via Docker, runs tests, tears down
```

Tests use Apollo's `executeOperation` directly (no HTTP layer) against a local DynamoDB table that is created and destroyed each run.

To run tests manually against an already-running DynamoDB Local:

```bash
docker run -p 8000:8000 amazon/dynamodb-local
npm test
```

## Deployment

Push to `master` to trigger CI:

1. **test** — spins up DynamoDB Local as a Docker service, runs the test suite
3. **deploy-prod** — deploys to the `production` stage on AWS

AWS credentials are stored as `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` GitHub secrets.

The API URL is printed at the end of each deploy. The production endpoint is served via CloudFront.

## Front-end repo

https://github.com/4-life/lambda-digital-client
