'use server';

import { AuthError } from 'next-auth';
import { signIn } from '@/auth';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

export interface RegisterState {
  error?: string;
}

export async function registerAction(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const email = String(formData.get('email') ?? '');
  const username = String(formData.get('username') ?? '');
  const password = String(formData.get('password') ?? '');

  if (!email || username.length < 3 || password.length < 8) {
    return { error: 'Enter a valid email, a username (3+ chars), and a password of at least 8 characters.' };
  }

  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password }),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null;
    return { error: body?.message ?? 'Registration failed.' };
  }

  try {
    await signIn('credentials', { email, password, redirectTo: '/home' });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Account created, but sign-in failed. Try logging in.' };
    }
    throw error;
  }

  return {};
}
