# @astra-void/auth-kit

[![npm](https://img.shields.io/npm/v/@astra-void/auth-kit)](https://www.npmjs.com/package/@astra-void/auth-kit)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> 🔐 Next.js authentication with passkey support.
> While core features are stable, APIs may change before v1.0.0.

**@astra-void/auth-kit** is a simple authentication kit for Next.js, supporting both traditional email/password and modern passkey (WebAuthn) login flows. Designed for flexibility, it works with any database via adapter-based architecture.

---

## Documentation

Full docs →
👉 [https://auth-kit-documentation.vercel.app](https://auth-kit-documentation.vercel.app)

---

## Features

* ✅ Email + Password login
* ✅ Passkey (WebAuthn) support
* ✅ JWT cookie-based sessions
* ✅ Adapter system (Prisma, custom, etc.)
* ✅ Middleware for protected routes
* ✅ Lightweight and database-agnostic

---

## Installation

```bash
npm i @astra-void/auth-kit
# or
pnpm add @astra-void/auth-kit
```

---

## Quick Start

> This example uses [Prisma](https://www.prisma.io/).

### 1. API Route

```ts
// app/api/auth/[...authkit]/route.ts
import { AuthKit } from '@astra-void/auth-kit';
import { PrismaAdapter } from '@astra-void/auth-kit/adapters';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const handler = AuthKit({
  adapter: PrismaAdapter(prisma),
});

export { handler as GET, handler as POST };
```

### 2. Middleware Setup

```ts
// middleware.ts
import { AuthKitMiddleware } from '@astra-void/auth-kit/middleware';

const middleware = AuthKitMiddleware({
  protectedRoutes: ['dashboard'], // Protect pages under /dashboard
});

export { middleware };

export const config = {
  matcher: ['/((?!api|_next/static|favicon.ico).*)'],
};
```

### 3. Client Hook

```ts
import { useSession } from '@astra-void/auth-kit/react';
import { useRouter } from 'next/navigation';

const { data: user, status } = useSession();
const router = useRouter();

if (status === 'loading') return <p>Loading...</p>;
if (status === 'unauthenticated') router.push('/login');

return <p>Welcome {user?.email}!</p>;
```

---

## Example Schema

```prisma
model User {
  id             String    @id @default(uuid())
  email          String    @unique
  hashedPassword String
  passkeys       Passkey[]
}

model Passkey {
  id         String   @id @default(uuid())
  publicKey  Bytes
  userId     String
  webAuthnId Bytes    @unique
  transports String
  counter    Int
  user       User     @relation(fields: [userId], references: [id])
}
```

---

## Customization

Want to use your own DB? Check out the [Adapters Guide](https://auth-kit-documentation.vercel.app/documentation/adapters/overview) to build a custom adapter.

---

## License

MIT © [@astra-void](https://github.com/astra-void)
