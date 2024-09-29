import { OpenAPIObjectConfig } from "@asteasolutions/zod-to-openapi/dist/v3.0/openapi-generator";

export type DocumentConfig = {
  version: string;
  title: string;
  description: string;
  servers: OpenAPIObjectConfig["servers"];
  input?: {
    directories?: string[];
    endpointFileName?: string;
    requestFileName?: string;
    responseFileName?: string;
    tags?: DocumentTags;
  };
  output?: {
    directory?: string;
    fileName?: string;
  };
};

export type DocumentTags = Record<
  string,
  NonNullable<OpenAPIObjectConfig["tags"]>[number]
>;
