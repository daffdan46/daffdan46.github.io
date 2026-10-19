import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      client: z.string(),
      role: z.string(),
      scope: z.array(z.string()),
      year: z.string(),
      category: z.string(),
      order: z.number(),
      featured: z.boolean().default(false),
      accent: z.string().default('#C8A97E'),
      cover: image(),
      detail: image().optional(),
      gallery: z.array(z.object({ src: image(), alt: z.string(), size: z.enum(['full', 'half', 'tall']).default('full') })).default([]),
      result: z.string().optional(),
    }),
});

export const collections = { projects };
