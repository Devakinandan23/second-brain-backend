import z, { optional } from 'zod';
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
    link: z.url(),
    title: z
        .string()
        .max(1000, "Title cannot exceed 1000 characters"),
    extractedTitle:
        z
        .string()
        .max(1000, "Title cannot exceed 1000 characters")
        .optional()
        .nullable(),
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
    description: z.string().optional().nullable(),
    thumbnail: z.string().optional().nullable(),
    authorName: z.string().nullable(),
    // metadata: z
    //         .record(z.string(), z.unknown())
    //         .nullable()
    //         .optional()
    //         .transform((v) => v ?? null),
})


export const contentUpdateSchema = z.object({
    link: z.url().optional().nullable(),
    title: z
        .string()
        .max(1000, "Title cannot exceed 1000 characters")
        .optional(),
    extractedTitle:
        z
        .string()
        .max(1000, "Title cannot exceed 1000 characters")
        .optional()
        .nullable(),
    tags: z
            .array(
                z
                .string()
                .min(1, "Tag cannot be empty")
                .max(30, "Tag too long")
                .trim()
                .toLowerCase()
            )
            .max(10, "Maximum 10 tags allowed")
            .optional()
            .nullable(),
    content: z
        .string()
        .optional()
        .nullable(),

    description: z.string().optional().nullable(),
    thumbnail: z.string().optional().nullable(),
    authorName: z.string().optional().nullable(),
    metadata: z
            .record(z.string(), z.unknown())
            .nullable()
            .optional()
            .transform((v) => v ?? null),
    isPublic: z.boolean().optional(),
    isFavorite: z.boolean().optional()
})

export const linkSchema = z.object({
    share: z.boolean()
}) 

export const importSchema = z.object({
    version: z.string().default("1.0"),
    entries: z.array(z.object({
        sourceType: z.enum([
            "YOUTUBE",
            "TWITTER",
            "NOTION",
            "GOOGLE_DOC",
            "WEBSITE",
            "INTERNAL"
        ]).default("INTERNAL"),
        link: z.string().url().nullable().optional(),
        title: z.string().min(1, "Title is required").max(1000, "Title cannot exceed 1000 characters"),
        content: z.string().nullable().optional(),
        description: z.string().nullable().optional(),
        thumbnail: z.string().nullable().optional(),
        authorName: z.string().nullable().optional(),
        tags: z.array(z.string()).default([]),
        isPublic: z.boolean().default(false),
        isFavorite: z.boolean().default(false)
    })).min(1, "At least one note is required")
})