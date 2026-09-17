import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// One entry per case study PER LANGUAGE (src/content/work/it/*.md and
// src/content/work/en/*.md). `caseId` is what links the two: it's how the
// language switcher on a /work/[slug] page finds the other locale's slug
// without the two files needing matching filenames.
const work = defineCollection({
  // Default id generation falls back to the frontmatter `slug` field, and
  // every case study intentionally uses the SAME slug in both locales (so
  // the language switcher can map one to the other) — which collided the
  // two files into one entry. Keyed on the file path instead.
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/work',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    caseId: z.string(),
    locale: z.enum(['it', 'en']),
    slug: z.string(),
    client: z.string(),
    title: z.string(),
    excerpt: z.string(),
    sector: z.string(),
    year: z.string().optional(),
    featured: z.boolean().default(false),
    // No `image()` helper: none of these clients have a supplied cover
    // photo yet, and the brief is explicit — no invented product shots.
    // A real photo lands here as a plain path once someone supplies one.
    cover: z.string().optional(),
    services: z.array(z.string()).default([]),
    metrics: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
          note: z.string().optional(),
        })
      )
      .default([]),
    technologies: z.array(z.string()).default([]),
    // A simplified chain of steps for the case's Architecture section.
    // Omitted entirely — not filled with a generic placeholder — for cases
    // where we don't have a real, specific flow to show (e.g. the two
    // analysis-only engagements, or a method-focused case with no distinct
    // technical architecture of its own).
    architecture: z.array(z.string()).optional(),
    relatedCase: z.string().optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
  }),
});

export const collections = { work };
