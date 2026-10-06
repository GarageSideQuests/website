import { defineCollection, reference } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
const link = z.object({
  label: z.string(),
  url: z.url(),
  affiliate: z.boolean().default(false),
});
const picture = z.object({
  src: z.string(),
  alt: z.string().min(1),
  width: z.number().positive(),
  height: z.number().positive(),
  caption: z.string().optional(),
});
const quests = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/quests" }),
  schema: z.object({
    title: z.string(),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    status: z.enum(["planned", "active", "paused", "complete", "abandoned"]),
    summary: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    startDate: z.coerce.date().optional(),
    updatedDate: z.coerce.date().optional(),
    heroImage: picture.optional(),
    githubUrl: z.url().optional(),
    videoUrl: z.url().optional(),
    externalLinks: z.array(link).default([]),
    gear: z.array(reference("gear")).default([]),
    downloads: z.array(link).default([]),
    products: z.array(link).default([]),
  }),
});
const log = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/log" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    quest: reference("quests"),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    images: z.array(picture).default([]),
    externalLinks: z.array(link).default([]),
    githubUrl: z.url().optional(),
    videoUrl: z.url().optional(),
  }),
});
const gear = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/gear" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    links: z.array(link).default([]),
  }),
});
export const collections = { quests, log, gear };
