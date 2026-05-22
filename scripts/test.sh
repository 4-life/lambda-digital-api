#!/bin/bash
set -e

trap 'docker compose down' EXIT

docker compose up -d
npm test
