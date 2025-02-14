import { z } from "../../../node_modules/zodocs/build";

export const User = z.object({
  id: z.number(),
  name: z.string(),
});
export type User = z.infer<typeof User>;
