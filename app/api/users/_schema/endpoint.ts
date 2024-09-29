import { docs } from "@/schema";
import { Tags } from "@/schema.config";
import {
  DeleteUserPathParameter,
  GetUserPathParameter,
  GetUsersQueryParameter,
  PatchUserBody,
  PatchUserPathParameter,
  PostUserBody,
} from "./request";
import {
  DeleteUserResponse,
  GetUserResponse,
  GetUsersResponse,
  PatchUserResponse,
  PostUserResponse,
} from "./response";
import { HttpStatus } from "@/utilities";

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
