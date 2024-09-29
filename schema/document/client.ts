import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import * as z from "zod";
import { DESCRIPTION_NEW_LINE, toDescription } from "./converter";

extendZodWithOpenApi(z.z);

z.ZodType.prototype.desc = function (description: string) {
  return this.describe(
    toDescription(description) +
      "\n" +
      DESCRIPTION_NEW_LINE +
      DESCRIPTION_NEW_LINE,
  );
};

export { z };
