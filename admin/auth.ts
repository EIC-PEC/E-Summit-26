// auth.ts
// next-auth v5 (Auth.js) config for the staff operations portal.
//
// Credentials are proxied to E_Summit_Backend's /auth/login. Only staff roles
// may hold a session here — DELEGATE accounts are rejected at authorize().
//
// Refresh strategy: the backend sets an httpOnly `refreshToken` cookie scoped
// to its own origin (:4000), which the browser never sends to this app. We lift
// the raw value out of the login response's Set-Cookie header and keep it
// inside the encrypted next-auth JWT (server-side only), then call
// POST /auth/refresh with a hand-attached Cookie header when the short-lived
// access token is close to expiring.

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import type { JWT } from 'next-auth/jwt';
import type { Role } from './lib/types';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1';

/** JWT_ACCESS_TTL defaults to 15m on the backend; refresh a minute early. */
const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;
const REFRESH_SKEW_MS = 60 * 1000;

/** Roles permitted to hold a session in this portal. */
const STAFF_ROLES: Role[] = [
  'SUPER_ADMIN',
  'ORGANIZER',
  'VOLUNTEER_CHECKIN',
  'INVESTOR',
];

function extractRefreshToken(setCookie: string | null): string | undefined {
  if (!setCookie) return undefined;
  return /(?:^|,\s*)refreshToken=([^;]+)/.exec(setCookie)?.[1];
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: `refreshToken=${token.refreshToken as string}` },
    });
    if (!res.ok) throw new Error('refresh rejected');

    const data = await res.json();
    return {
      ...token,
      accessToken: data.accessToken,
      // The backend rotates refresh tokens, so adopt the new one.
      refreshToken:
        extractRefreshToken(res.headers.get('set-cookie')) ?? token.refreshToken,
      accessTokenExpires: Date.now() + ACCESS_TOKEN_TTL_MS,
      role: data.user.role,
      error: undefined,
    };
  } catch {
    return { ...token, error: 'RefreshAccessTokenError' };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  trustHost: true,

  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          const msg = Array.isArray(body?.message) ? body.message[0] : body?.message;
          throw new Error(msg || 'Invalid email or password.');
        }

        const data = await res.json();

        // Delegates are summit attendees, not operations staff.
        if (!STAFF_ROLES.includes(data.user.role)) {
          throw new Error(
            'This portal is for PEC Summit staff only. Delegate accounts cannot sign in here.',
          );
        }

        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          college: data.user.college,
          accessToken: data.accessToken,
          refreshToken: extractRefreshToken(res.headers.get('set-cookie')),
          accessTokenExpires: Date.now() + ACCESS_TOKEN_TTL_MS,
        } as never;
      },
    }),
  ],

  callbacks: {
    // Consulted for route gating.
    authorized({ auth: session, request }: { auth: any; request: any }) {
      if (request.nextUrl.pathname === '/login') return true;
      return !!session?.user;
    },

    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) return { ...token, ...(user as unknown as Record<string, unknown>) };

      const expires = token.accessTokenExpires as number | undefined;
      if (expires && Date.now() < expires - REFRESH_SKEW_MS) return token;
      if (!token.refreshToken) return token;

      return refreshAccessToken(token);
    },

    async session({ session, token }: { session: any; token: any }) {
      session.accessToken = token.accessToken as string | undefined;
      session.error = token.error as string | undefined;
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.college = token.college as string | null;
      }
      return session;
    },
  },
} as any);
