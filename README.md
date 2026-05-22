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
| `npm run serve` | Run API locally — starts DynamoDB Local, seeds it, serves on port 3005 |
| `npm run test:local` | Run tests — starts DynamoDB Local via Docker automatically |
| `npm run deploy-prod` | Deploy to `production` stage (requires AWS credentials) |
| `npm run dev` | Live Lambda dev via `sst dev` — proxies AWS traffic to local code (requires AWS credentials) |
| `npm run seed` | Seed DynamoDB manually (requires `TABLE_NAME` and AWS env vars) |
| `npm test` | Run tests against an already-running DynamoDB Local on port 8000 |

## Running locally

Requires Docker. No AWS account needed.

```bash
npm install
npx sst install   # generate SST type definitions (one-time)
npm run serve     # starts DynamoDB Local, seeds 100 items, serves GraphQL at http://localhost:3005
```

## Testing

```bash
npm run test:local
```

Starts DynamoDB Local, runs the full test suite, tears everything down on exit.

## Deployment

Push to `master` to trigger CI:

1. **test** — runs the test suite against DynamoDB Local
2. **deploy** — deploys to `production` on AWS
3. **seed** — re-seeds the production DynamoDB table with 100 fresh items

## Deployment

Push to `master` to trigger CI:

1. **test** — spins up DynamoDB Local as a Docker service, runs the test suite
3. **deploy-prod** — deploys to the `production` stage on AWS

AWS credentials are stored as `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` GitHub secrets.

The API URL is printed at the end of each deploy. The production endpoint is served via CloudFront.

## Front-end repo

https://github.com/4-life/lambda-digital-client
