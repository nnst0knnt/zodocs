import { z } from "@/schema";

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

export const PatchUserPathParameter = z.object({
  id: z.number().desc("ユーザーID").openapi({
    example: 1,
  }),
});
export type PatchUserPathParameter = z.infer<typeof PatchUserPathParameter>;
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

export const DeleteUserPathParameter = z.object({
  id: z.number().desc("ユーザーID").openapi({
    example: 1,
  }),
});
export type DeleteUserPathParameter = z.infer<typeof DeleteUserPathParameter>;
