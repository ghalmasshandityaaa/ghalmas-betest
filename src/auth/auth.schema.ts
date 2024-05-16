import { z } from 'zod';

export const SignInDTOSchema = z.object({
  emailAddress: z
    .string({ required_error: 'Email is required' })
    .email({ message: 'Email must be valid' }),
  password: z.string({ required_error: 'Password is required' }).min(6).max(48),
});

export const SignUpDTOSchema = z.object({
  emailAddress: z
    .string({ required_error: 'Email is required' })
    .email({ message: 'Email must be valid' }),
  password: z.string({ required_error: 'Password is required' }).min(6).max(48),
  userName: z.string({ required_error: 'Username is required' }),
  accountNumber: z.string({ required_error: 'Account number is required' }),
  identityNumber: z.string({ required_error: 'Identity number is required' }),
});

export type SignInSchema = z.infer<typeof SignInDTOSchema>;
export type SignUpSchema = z.infer<typeof SignUpDTOSchema>;
export type UserSession = { sessionId: string; userId: string };
