import { UserSchema, z } from "@/schema";

export const GetUsersResponse = UserSchema.openapi({
  example: [
    {
      id: 1,
      name: "佐藤 太郎",
    },
    {
      id: 2,
      name: "佐藤 次郎",
    },
    {
      id: 3,
      name: "佐藤 三郎",
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
