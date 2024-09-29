## 概要

Zodスキーマを利用してOpenAPIのドキュメントを自動生成します。

## 目次

- [フォルダ構成](#フォルダ構成)
- [実装](#実装)
  - [リクエストスキーマの定義](#-リクエストスキーマの定義)
  - [レスポンススキーマの定義](#-レスポンススキーマの定義)
  - [エンドポイントの定義](#-エンドポイントの定義)
  - [APIの実装](#-apiの実装)
- [使用方法](#使用方法)
  - [ドキュメントを生成](#-ドキュメントを生成)
  - [ドキュメントを確認](#-ドキュメントを確認)
  - [OpenAPIコンテナのポートを変更](#-openapiコンテナのポートを変更)
- [設定ファイル](#設定ファイル)

## フォルダ構成

OpenAPIドキュメント生成のために、以下のようなフォルダ構成にしています。

```
├── api
│   └── users
│       ├── [id]
│       │   └── route.ts
│       ├── _schema ------------------ スキーマの定義を格納するディレクトリ
│       │   ├── endpoint.ts ---------- /users配下の各エンドポイントごとにOpenAPIの定義を行うファイル
│       │   ├── index.ts
│       │   ├── request.ts ----------- /users配下のリクエストに関連するスキーマを定義するファイル
│       │   └── response.ts ---------- /users配下のレスポンスに関連するスキーマを定義するファイル
│       └── route.ts
```

## 実装

### ■ リクエストスキーマの定義

`request.ts` ファイルにリクエストのスキーマを定義します。

#### **クエリパラメータ、パスパラメータのスキーマ定義**

- `z.object()`などを使用してスキーマを定義します。
- `z.number()` や `z.string()` などの適切な型を使用します。
- 各プロパティに対して、`desc()` メソッドで説明を追加します。
- 各プロパティに対して、`openapi()` メソッドでリクエスト例を追加します。

```typescript
export const GetUsersQueryParameter = z.object({
  page: z.number().desc("ページ番号").openapi({
    example: 1,
  }),
  limit: z.number().desc("取得件数").openapi({
    example: 10,
  }),
});
export type GetUsersQueryParameter = z.infer<typeof GetUsersQueryParameter>;

export const GetUserPathParameter = z.object({
  id: z.number().desc("ユーザーID").openapi({
    example: 1,
  }),
});
export type GetUserPathParameter = z.infer<typeof GetUserPathParameter>;

export const PatchUserPathParameter = z.object({
  id: z.number().desc("ユーザーID").openapi({
    example: 1,
  }),
});
export type PatchUserPathParameter = z.infer<typeof PatchUserPathParameter>;

export const DeleteUserPathParameter = z.object({
  id: z.number().desc("ユーザーID").openapi({
    example: 1,
  }),
});
export type DeleteUserPathParameter = z.infer<typeof DeleteUserPathParameter>;
```

#### **リクエストボディのスキーマ定義**

- `z.object()`などを使用してスキーマを定義します。
- `z.number()`や`z.string()`などの適切な型を使用します。
- 各プロパティに対して、`desc()`メソッドで説明を追加します。
- リクエストボディのスキーマに対して、`openapi()`メソッドでリクエスト例を追加します。

```typescript
export const PostUserBody = z
  .object({
    name: z
      .string()
      .max(100, "名前は100文字以内で入力してください")
      .desc("名前"),
  })
  .openapi({
    example: {
      name: "佐藤 太郎",
    },
  });
export type PostUserBody = z.infer<typeof PostUserBody>;

export const PatchUserBody = z
  .object({
    name: z
      .string()
      .max(100, "名前は100文字以内で入力してください")
      .desc("名前"),
  })
  .openapi({
    example: {
      name: "田中 太郎",
    },
  });
export type PatchUserBody = z.infer<typeof PatchUserBody>;
```

### ■ レスポンススキーマの定義

`response.ts`ファイルにレスポンスのスキーマを定義します。

#### **レスポンスのスキーマ定義**

- Prismaのモデルから自動生成されたZodスキーマ（`UserSchema`）を再利用できます。
- 各レスポンスのスキーマに対して、`openapi()`メソッドでレスポンス例を追加します。

```typescript
export const GetUsersResponse = UserSchema.pick({
  id: true,
  name: true,
})
  .extend({
    additional_property: z
      .string()
      .desc("UserSchemaを拡張してプロパティを追加"),
  })
  .openapi({
    example: [
      {
        id: 1,
        name: "佐藤 太郎",
        additional_property: "ADDITIONAL_PROPERTY1",
      },
      {
        id: 2,
        name: "佐藤 次郎",
        additional_property: "ADDITIONAL_PROPERTY2",
      },
      {
        id: 3,
        name: "佐藤 三郎",
        additional_property: "ADDITIONAL_PROPERTY3",
      },
    ],
  });
export type GetUsersResponse = z.infer<typeof GetUsersResponse>[];

export const GetUserResponse = UserSchema.openapi({
  example: {
    id: 1,
    name: "佐藤 太郎",
  },
});
export type GetUserResponse = z.infer<typeof GetUserResponse>;

export const PostUserResponse = UserSchema.openapi({
  example: {
    id: 1,
    name: "佐藤 太郎",
  },
});
export type PostUserResponse = z.infer<typeof PostUserResponse>;

export const PatchUserResponse = z
  .object({
    id: z.number().desc("ユーザーID"),
    name: z.string().desc("名前"),
  })
  .openapi({
    example: {
      id: 1,
      name: "田中 太郎",
    },
  });
export type PatchUserResponse = z.infer<typeof PatchUserResponse>;

export const DeleteUserResponse = UserSchema.openapi({
  example: {
    id: 1,
    name: "佐藤 太郎",
  },
});
export type DeleteUserResponse = z.infer<typeof DeleteUserResponse>;
```

### ■ エンドポイントの定義

`endpoint.ts` ファイルでAPIエンドポイントを定義します。

#### **各HTTPメソッドの定義**

- `docs.generator.get()`、`docs.generator.post()`などのメソッドを使用します。
- エンドポイントの詳細情報（名前、概要、説明、タグなど）を指定します。
- リクエストとレスポンスのスキーマを関連付けます。

```typescript
docs.generator.get({
  name: "/users",
  summary: "ユーザー一覧を取得する",
  description: "ページネーションされたユーザー一覧を取得する",
  operationName: "get-users",
  tags: [Tags.User],
  request: {
    parameters: {
      query: {
        schema: GetUsersQueryParameter,
      },
    },
  },
  response: {
    [HttpStatus.Ok]: {
      schema: GetUsersResponse,
    },
  },
});

docs.generator.get({
  name: "/users/{id}",
  summary: "ユーザーを取得する",
  description: "指定されたIDと紐づくユーザーを取得する",
  operationName: "get-user",
  tags: [Tags.User],
  request: {
    parameters: {
      path: {
        schema: GetUserPathParameter,
      },
    },
  },
  response: {
    [HttpStatus.Ok]: {
      schema: GetUserResponse,
    },
  },
});

docs.generator.post({
  name: "/users",
  summary: "ユーザーを作成する",
  description: "新規にユーザーを作成する",
  operationName: "post-user",
  tags: [Tags.User],
  request: {
    body: {
      schema: PostUserBody,
    },
  },
  response: {
    [HttpStatus.Ok]: {
      schema: PostUserResponse,
    },
  },
});

docs.generator.patch({
  name: "/users/{id}",
  summary: "ユーザーを更新する",
  description: "指定されたIDと紐づくユーザーを更新する",
  operationName: "patch-user",
  tags: [Tags.User],
  request: {
    parameters: {
      path: {
        schema: PatchUserPathParameter,
      },
    },
    body: {
      schema: PatchUserBody,
    },
  },
  response: {
    [HttpStatus.Ok]: {
      schema: PatchUserResponse,
    },
  },
});

docs.generator.delete({
  name: "/users/{id}",
  summary: "ユーザーを削除する",
  description: "指定されたIDと紐づくユーザーを削除する",
  operationName: "deleteUser",
  tags: [Tags.User],
  request: {
    parameters: {
      path: {
        schema: DeleteUserPathParameter,
      },
    },
  },
  response: {
    [HttpStatus.Ok]: {
      schema: DeleteUserResponse,
    },
  },
});
```

### ■ APIの実装

- requestとresponseに対して、Zodスキーマの型を指定します。
  - 必須ではないですが、Zodスキーマの変更にAPIの実装を追従させやすくなると思うので推奨します。
- Node.js標準の`Request`やNext.jsの`NextRequest`だとクエリパラメータに型がつかないので、`NextRequest`を拡張した自前の`Request`を作成しています。
- パスパラメータも同様に、Zodの型が参照されるように`RequestPath`というユーティリティを作成しています。

```typescript
export const GET = async (request: Request<GetUsersQueryParameter>) => {
  const queries = {
    page: request.nextUrl.searchParams.has("page")
      ? Number(request.nextUrl.searchParams.get("page"))
      : 1,
    limit: request.nextUrl.searchParams.has("limit")
      ? Number(request.nextUrl.searchParams.get("limit"))
      : 10,
  };

  return response.ok<GetUsersResponse>(
    await db.user.findMany({
      skip: (queries.page - 1) * queries.limit,
      take: queries.limit,
    }),
  );
};

export const GET = async (
  _request: Request,
  { params = {} }: RequestPath<GetUserPathParameter>,
) => {
  const id = Number(params.id);

  if (!id) {
    return response.badRequest();
  }

  const user = await db.user.findUnique({ where: { id } });

  if (!user) {
    return response.notFound();
  }

  return response.ok<GetUserResponse>(user);
};

export const POST = async (request: Request) => {
  const body = await response.body<PostUserBody>(request);

  if (!body) {
    return response.badRequest();
  }

  const { success, data, error } = PostUserBody.safeParse(body);

  if (!success) {
    return response.unprocessableEntity(error);
  }

  return response.ok<PostUserResponse>(await db.user.create({ data }));
};

export const PATCH = async (
  request: Request,
  { params = {} }: RequestPath<PatchUserPathParameter>,
) => {
  const id = Number(params.id);

  if (!id) {
    return response.badRequest();
  }

  const user = await db.user.findUnique({ where: { id } });

  if (!user) {
    return response.notFound();
  }

  const body = await response.body<PatchUserBody>(request);

  if (!body) {
    return response.badRequest();
  }

  const { success, data, error } = PatchUserBody.safeParse(body);

  if (!success) {
    return response.unprocessableEntity(error);
  }

  return response.ok<PatchUserResponse>(
    await db.user.update({ where: { id }, data }),
  );
};

export const DELETE = async (
  _request: Request,
  { params = {} }: RequestPath<DeleteUserPathParameter>,
) => {
  const id = Number(params.id);

  if (!id) {
    return response.badRequest();
  }

  const user = await db.user.findUnique({ where: { id } });

  if (!user) {
    return response.notFound();
  }

  return response.ok<DeleteUserResponse>(
    await db.user.delete({ where: { id } }),
  );
};
```

## 使用方法

### ■ ドキュメントを生成

- `request.ts`、`response.ts`、`endpoint.ts`ファイルが実装済みであることを前提としています。
- OpenAPIドキュメント生成スクリプトを実行します。

  ```bash
  make docs
  ```

### ■ ドキュメントを確認

- APIサーバー（Next.js）が立ち上がっていることを確認します。

- OpenAPI用のコンテナが立ち上がっていることを確認します。

- ブラウザからアクセスします。
  - デフォルトで`http://localhost:9000`がOpenAPI用のポートに設定されています。

### ■ OpenAPIコンテナのポートを変更

- ポートを変更したい場合は`web/.env`の`OPENAPI_PORT`を変更したのち、OpenAPIのコンテナを立ち上げなおしてください。

## 設定ファイル

`schema.config.ts`でOpenAPIドキュメントのタイトルやタグなどの設定値を変更できます。

| プロパティ                         | 説明                                      |
| ---------------------------------- | ----------------------------------------- |
| `version`                          | APIのバージョン                           |
| `title`                            | OpenAPIドキュメントのタイトル             |
| `description`                      | OpenAPIドキュメントの説明                 |
| `servers`                          | APIを提供するサーバー情報                 |
| `servers[].url`                    | サーバーのURL                             |
| `servers[].description`            | サーバーの説明                            |
| `servers[].variables`              | URLで使用される変数の定義                 |
| `servers[].variables.port`         | ポート番号の変数設定                      |
| `servers[].variables.port.default` | デフォルトのポート番号                    |
| `input`                            | スキーマの設定                            |
| `input.directories`                | Zodスキーマの定義が含まれるディレクトリ名 |
| `input.endpointFileName`           | エンドポイントを定義するファイル名        |
| `input.requestFileName`            | リクエストスキーマを定義するファイル名    |
| `input.responseFileName`           | レスポンススキーマを定義するファイル名    |
| `input.tags`                       | OpenAPIドキュメントのタグ                 |
| `output`/                          | 出力先の設定                              |
| `output.fileName`                  | 生成されるOpenAPIドキュメントのファイル名 |

```typescript
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
```
