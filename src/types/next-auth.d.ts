import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      username?: string;
    } & DefaultSession['user'];
  }

  interface User {
    accessToken?: string;
    username?: string;
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    accessToken?: string;
    id?: string;
    username?: string;
  }
}
