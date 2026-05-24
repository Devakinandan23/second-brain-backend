import z from 'zod';
import { describe } from 'zod/v4/core';

const contentTypeSchema = z.enum([
    "YOUTUBE",
    "TWITTER",
    "NOTION",
    "GOOGLE_DOC",
    "WEBSITE",
    "INTERNAL"
])

//  description: parsedData.data.description,
//             thumbnail: parsedData.data.thumbnail,
//             authorName: parsedData.data.authorName,        
//             metadata: parsedData.data.metadata 

export const contentSchema = z.object({
    sourceType: contentTypeSchema,
    link: z.url(),
    title: z
        .string()
        .max(200, "Title cannot exceed 200 characters"),
    tags: z
            .array(
                z
                .string()
                .min(1, "Tag cannot be empty")
                .max(30, "Tag too long")
                .trim()
                .toLowerCase()
            )
            .max(10, "Maximum 10 tags allowed"),
    content: z
        .string()
        .nullable(),
    description: z.string().nullable(),
    thumbnail: z.string().nullable(),
    authorName: z.string().nullable(),
    metadata: z
            .record(z.string(), z.unknown())
            .nullable()
            .optional()
            .transform((v) => v ?? null)
})