import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  userName: z.string({ required_error: 'Name is required' }).min(1, 'Name should not be empty'),
  emailAddress: z
    .string({ required_error: 'Email is required' })
    .email({ message: 'Email must be valid' }),
  password: z.string({ required_error: 'Password is required' }),
  accountNumber: z.string({ required_error: 'Account number is required' }),
  identityNumber: z.string({ required_error: 'Identity number is required' }),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
