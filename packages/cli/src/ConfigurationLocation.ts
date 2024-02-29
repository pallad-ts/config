import { z } from "zod";

export const ConfigurationLocationSchema = z.object({
    file: z.string(),
    property: z.string().optional(),
});

export type ConfigurationLocation = z.infer<typeof ConfigurationLocationSchema>;
