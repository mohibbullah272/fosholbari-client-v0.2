// lib/validations/notificationschema.ts
import { z } from 'zod';

export const createNotificationSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  content: z.string()
    .min(1, 'Content is required')
    .max(500, 'Content must be less than 500 characters'),
  image: z.string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => !val || val === '' || val.startsWith('http://') || val.startsWith('https://'),
      'URL must start with http:// or https://'
    ),
  userIds: z.array(z.number().int().positive('User ID must be positive'))
    .optional()
    .default([]),
});

export type CreateNotificationFormData = z.infer<typeof createNotificationSchema>;