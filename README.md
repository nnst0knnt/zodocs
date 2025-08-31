# zodocs

## 概要

ZodスキーマからOpenAPIドキュメントを自動生成するツールを開発するリポジトリです。

## 技術スタック

- TypeScript
- Zod
- @asteasolutions/zod-to-openapi

## 使用方法

```bash
npm install

npm run docs

npm run dev
```

## 実装例

### リクエストスキーマの定義

`request.ts` ファイルにリクエストのスキーマを定義します。

#### クエリパラメータ、パスパラメータのスキーマ定義

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
```

#### リクエストボディのスキーマ定義

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
```

### レスポンススキーマの定義

`response.ts`ファイルにレスポンスのスキーマを定義します。

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
    ],
  });
```

### エンドポイントの定義

`endpoint.ts` ファイルで API エンドポイントを定義します。

```typescript
zodocs.generator.get({
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
```

### API の実装

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
    })
  );
};
```

### ドキュメント確認

1. API サーバー（Next.js）が立ち上がっていることを確認
2. OpenAPI 用のコンテナが立ち上がっていることを確認
3. ブラウザから`http://localhost:9000`にアクセス

### 設定ファイル

`zodocs.config.ts`でドキュメントの設定を変更できます。

| プロパティ                         | 説明                                                 |
| ---------------------------------- | ---------------------------------------------------- |
| `version`                          | ドキュメントのバージョン                             |
| `title`                            | ドキュメントのタイトル                               |
| `description`                      | ドキュメントの説明                                   |
| `servers`                          | API 提供サーバーの設定                               |
| `servers[].url`                    | サーバーの URL                                       |
| `servers[].description`            | サーバーの説明                                       |
| `servers[].variables`              | URL で使用する変数の定義                             |
| `servers[].variables.port`         | ポート番号の設定                                     |
| `servers[].variables.port.default` | デフォルトのポート番号                               |
| `input`                            | 入力設定                                             |
| `input.directories`                | スキーマ定義を含むディレクトリ（複数指定可）         |
| `input.endpointFileName`           | API エンドポイントを定義するファイル名               |
| `input.requestFileName`            | リクエストスキーマを定義するファイル名               |
| `input.responseFileName`           | レスポンススキーマを定義するファイル名               |
| `input.tags`                       | エンドポイントのグループ化に使用するタグ             |
| `output`                           | 出力設定                                             |
| `output.directory`                 | 出力先ディレクトリ（デフォルトはルートディレクトリ） |
| `output.fileName`                  | 出力ファイル名                                       |

```typescript
import type { ZodocsConfig, ZodocsTags } from "zodocs";

export const Tags = {} as const satisfies ZodocsTags;

const config: ZodocsConfig = {
  version: "1.0.0",
  title: "Generated API Document Title",
  description: "Generated API Document Description",
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
    directories: ["schema"],
    endpointFileName: "endpoint.ts",
    requestFileName: "request.ts",
    responseFileName: "response.ts",
    tags: Tags,
  },
  output: {
    directory: "",
    fileName: "zodocs.yml",
  },
};

export default config;
```
