/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "apollo-lambda",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: { region: "eu-central-1" },
      },
    };
  },
  async run() {
    const table = new sst.aws.Dynamo("ItemsTable", {
      fields: { id: "string" },
      primaryIndex: { hashKey: "id" },
    });

    const fn = {
      handler: "index.handler",
      runtime: "nodejs22.x",
      memory: "512 MB",
      timeout: "6 seconds",
      link: [table],
      environment: {
        NODE_ENV: $app.stage === "production" ? "prod" : "dev",
        STAGE: $app.stage,
        TABLE_NAME: table.name,
      },
      nodejs: {
        esbuild: { keepNames: true },
      },
    } satisfies sst.aws.FunctionArgs;

    const api = new sst.aws.ApiGatewayV2("GraphqlApi", {
      cors: {
        allowMethods: ["GET", "POST"],
        allowOrigins: ["*"],
        allowHeaders: ["content-type", "authorization"],
      },
    });

    api.route("$default", fn);

    return { url: api.url, table: table.name };
  },
});
