import { ZodOpenAPIMetadata } from "@asteasolutions/zod-to-openapi";

import { z } from "./client";

type Primitive = string | number | boolean | null | undefined;

type DateToString<T> = T extends Date
  ? string
  : T extends Primitive
    ? T
    : T extends Array<infer U>
      ? DateToString<U>[]
      : T extends object
        ? { [K in keyof T]: DateToString<T[K]> }
        : never;

type Metadata<T> = Omit<ZodOpenAPIMetadata, "example" | "examples"> & {
  example?: DateToString<T> | DateToString<T>[];
};

declare module "zod" {
  interface ZodType {
    openapi<T extends z.ZodTypeAny>(this: T, metadata: Metadata<z.input<T>>): T;
    desc(description: string): this;
  }
}
