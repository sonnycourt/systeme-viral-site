import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    heroImage: z.string().optional(),
    category: z.string(),
    tags: z.array(z.string()).optional(),
    author: z.string().default('Système Viral'),
    featured: z.boolean().default(false),
    readTime: z.number().optional(), // Temps de lecture en minutes
    difficulty: z.enum(['Débutant', 'Intermédiaire', 'Avancé']).optional(),
  }),
});

export const collections = {
  'blog': blogCollection,
};
