#!/bin/bash
set -e

trap 'docker compose down' EXIT

docker compose up -d

echo "Waiting for DynamoDB Local..."
until curl -s http://localhost:8000 > /dev/null 2>&1; do
  sleep 0.3
done

TABLE_NAME=items-test DYNAMODB_ENDPOINT=http://localhost:8000 AWS_REGION=eu-central-1 AWS_ACCESS_KEY_ID=local AWS_SECRET_ACCESS_KEY=local npm run seed
npm run serve:server
