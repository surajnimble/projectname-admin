import { z } from 'zod';

const schema = z.object({
  apiPrefix: z.string().startsWith('/').default('/api/v1'),
  encryptionEnabled: z.boolean().default(false),
});

export const env = schema.parse({
  apiPrefix: process.env.NEXT_PUBLIC_API_PREFIX || undefined,
  encryptionEnabled: process.env.NEXT_PUBLIC_ENCRYPTION_ENABLED === 'true',
});
