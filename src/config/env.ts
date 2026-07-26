import { z } from 'zod'

const schema = z.object({
  VITE_API_URL: z.string().url(),
  VITE_USE_MOCK_AUTH: z.string().optional(),
})

export const env = schema.parse({
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_USE_MOCK_AUTH: import.meta.env.VITE_USE_MOCK_AUTH,
})
