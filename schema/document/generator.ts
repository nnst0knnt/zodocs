import type {
  RouteConfig,
  ZodMediaTypeObject,
} from "@asteasolutions/zod-to-openapi";
import {
  OpenApiGeneratorV3,
  OpenAPIRegistry,
} from "@asteasolutions/zod-to-openapi";
import type { ZodMediaType } from "@asteasolutions/zod-to-openapi/dist/openapi-registry";
import { camelCase, flow, upperFirst } from "lodash";
import type { ZodNull, ZodObject, ZodRawShape, ZodTypeAny } from "zod";
import { RequireAtLeastOne } from "type-fest";
import { HttpMethod, HttpStatus } from "./primitive";
import { toDescription } from "./converter";
import { DocumentConfig, DocumentTags } from "./config";

const openapi = new OpenAPIRegistry();

/**
 * Zodのスキーマを追加する
 */
type AddSchemasArgs = {
  name: string;
  schema: ZodObject<ZodRawShape> | ZodMediaTypeObject["schema"];
};
export const addSchemas = ({ name, schema }: AddSchemasArgs) =>
  openapi.register(name, schema as ZodTypeAny);

/**
 * リクエストとレスポンスのスキーマを追加する
 */
type AddDefaultSchemasArgs = {
  operationName: string;
  request: AddDocumentArgs["request"];
  response: AddDocumentArgs["response"];
};
const addDefaultSchemas = ({
  operationName,
  request,
  response,
}: AddDefaultSchemasArgs) => {
  const baseOperationName = flow(camelCase, upperFirst)(operationName);

  if (request) {
    if (request.body) {
      addSchemas({
        name: `📦 ${baseOperationName}Body`,
        schema: request.body.schema,
      });
    }
    if (request.parameters && request.parameters.path) {
      addSchemas({
        name: `🛤️ ${baseOperationName}Path`,
        schema: request.parameters.path.schema,
      });
    }
    if (request.parameters && request.parameters.query) {
      addSchemas({
        name: `🔍 ${baseOperationName}Query`,
        schema: request.parameters.query.schema,
      });
    }
  }

  Object.entries(response).forEach(([status, { schema }]) => {
    addSchemas({
      name: `💬 ${baseOperationName}Response ${status}`,
      schema,
    });
  });
};

/**
 * Zodのスキーマからドキュメントを作成する
 */
type AddDocumentArgs = {
  name: RouteConfig["path"];
  media?: ZodMediaType;
  summary: string;
  description: string;
  operationName: string;
  tags: DocumentTags[keyof DocumentTags][];
  request?: {
    body?: {
      schema: ZodMediaTypeObject["schema"];
      description?: string;
      encoding?: ZodMediaTypeObject["encoding"];
    };
    parameters?: {
      path?: {
        schema: ZodObject<ZodRawShape>;
      };
      query?: {
        schema: ZodObject<ZodRawShape>;
      };
    };
  };
  response: RequireAtLeastOne<{
    [key in HttpStatus]: {
      schema: ZodObject<ZodRawShape> | ZodNull;
      description?: string;
      encoding?: ZodMediaTypeObject["encoding"];
    };
  }>;
};
const addDocument = ({
  media = "application/json",
  ...args
}: AddDocumentArgs & {
  method: HttpMethod;
}) => {
  addDefaultSchemas({
    operationName: args.operationName,
    request: args.request,
    response: args.response,
  });

  openapi.registerPath({
    method: args.method,
    path: args.name,
    operationId: args.operationName,
    tags: Object.values(args.tags).map(({ name }) => name),
    ...(args.description
      ? { description: toDescription(args.description) }
      : {}),
    ...(args.summary ? { summary: args.summary } : {}),
    ...(args.request
      ? {
          request: {
            ...(args.request.parameters?.path
              ? {
                  params: args.request.parameters.path.schema,
                }
              : {}),
            ...(args.request.parameters?.query
              ? {
                  query: args.request.parameters.query.schema,
                }
              : {}),
            ...(args.request.body
              ? {
                  body: {
                    ...(args.request.body.description
                      ? {
                          description: toDescription(
                            args.request.body.description,
                          ),
                        }
                      : {}),
                    content: {
                      [media]: {
                        schema: args.request.body.schema,
                        ...(args.request.body.encoding
                          ? { encoding: args.request.body.encoding }
                          : {}),
                      },
                    },
                  },
                }
              : {}),
          },
        }
      : {}),
    responses: Object.entries(args.response).reduce(
      (response, [status, args]) => ({
        ...response,
        [status]: {
          description: args.description
            ? toDescription(args.description)
            : status,
          content: {
            [media]: {
              schema: args.schema,
              ...(args.encoding ? { encoding: args.encoding } : {}),
            },
          },
        },
      }),
      {},
    ),
  });
};

/**
 * OpenAPIドキュメントを生成する
 */
const generateDocument = (config: DocumentConfig) => {
  const generator = new OpenApiGeneratorV3(openapi.definitions);

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      version: config.version,
      title: config.title,
      ...(config.description
        ? { description: toDescription(config.description) }
        : {}),
    },
    ...(config.servers ? { servers: config.servers } : {}),
    tags:
      config.input && config.input.tags ? Object.values(config.input.tags) : [],
  });
};

/**
 * OpenAPIドキュメント生成オブジェクト
 */
type Docs = {
  generator: {
    get: (args: AddDocumentArgs) => void;
    post: (args: AddDocumentArgs) => void;
    put: (args: AddDocumentArgs) => void;
    patch: (args: AddDocumentArgs) => void;
    delete: (args: AddDocumentArgs) => void;
  };
  generate: (
    args: DocumentConfig,
  ) => ReturnType<OpenApiGeneratorV3["generateDocument"]>;
};
export const docs: Docs = {
  generator: {
    get: (args) => addDocument({ method: HttpMethod.Get, ...args }),
    post: (args) => addDocument({ method: HttpMethod.Post, ...args }),
    put: (args) => addDocument({ method: HttpMethod.Put, ...args }),
    patch: (args) => addDocument({ method: HttpMethod.Patch, ...args }),
    delete: (args) => addDocument({ method: HttpMethod.Delete, ...args }),
  },
  generate: (args) => generateDocument(args),
};
