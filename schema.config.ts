import type { DocumentConfig, DocumentTags } from "@/schema";

export const Tags = {
  User: {
    name: "users",
    description: "ユーザー情報に関連するエンドポイント",
  },
} as const satisfies DocumentTags;

const config: DocumentConfig = {
  version: "0.1.0",
  title: "Sample API",
  description: "サンプルのAPIドキュメント",
  servers: [
    {
      url: `http://localhost:{port}/api`,
      description: "ローカル環境",
      variables: {
        port: {
          default: "3000",
        },
      },
    },
  ],
  input: {
    directories: ["_schema"],
    endpointFileName: "endpoint.ts",
    requestFileName: "request.ts",
    responseFileName: "response.ts",
    tags: Tags,
  },
  output: {
    fileName: "openapi-docs.yml",
  },
};

export default config;
