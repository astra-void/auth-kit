# @astra-void/auth-kit

[![npm](https://img.shields.io/npm/v/@astra-void/auth-kit)](https://www.npmjs.com/package/@astra-void/auth-kit)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> Lightweight authentication kit for Next.js
> **Still developing – subject to change**

---

## Security Note
⚠️ This library handles sensitive authentication logic. Please review and test carefully before using in production.

---

## 🚀 Getting Started

### 1. Install

```bash
npm install @astra-void/auth-kit
```

or

```bash
pnpm add @astra-void/auth-kit
```

### 2. Directory Structure

Set up your project like this:

```txt
📂 your-nextjs-app
│ app/
│  └─ api/
│     └─ auth/
│        └─ [...authkit]/
│           └─ route.ts
└─ middleware.ts
```

---

## ⚙️ Setup

### `app/api/auth/[...authkit]/route.ts`

```ts
import { Adapter, AuthKit } from "@astra-void/auth-kit";

const handler = AuthKit({
  adapter: YourAdapter, // Provide your own adapter
});

export { handler as GET, handler as POST };
```

### Adapter Types
```ts
export interface Adapter {
    createUser?: (email: string, hashedPassword: string, username?: string) => Promise<AdapterUser>;
    getUser?: (id: string) => Promise<AdapterUser | null>;
    getUserByEmail?: (email: string) => Promise<AdapterUser | null>;
    updateUser?: (userId: string, data: Partial<AdapterUser>) => Promise<AdapterUser>;
    deleteUser?: (userId: string) => Promise<null>;
    createPasskey?: (userId: string, webAuthnId: Buffer, publicKey: Buffer, transports: string) => Promise<Passkey>;
    getPasskey?: (userId: string) => Promise<Passkey[] | null>;
    getPasskeyByEmail?: (email: string) => Promise<Passkey[] | null>;
    updatePasskey?: (passkeyId: string, data: Partial<Passkey>) => Promise<Passkey>;
    deletePasskey?: (userId: string) => Promise<null>;
}
```

### User interface
```ts
export interface User {
    id: string;
    email?: string;
    hashedPassword?: string;
    createdAt: Date;
    updatedAt: Date;
}
```
also Adapter User interface
```ts
export interface AdapterUser extends User {
    passkeys?: Passkey[]
}
```

### Passkey interface 
```ts
export interface Passkey {
    id: string;
    publicKey: Buffer;
    userId: string;
    webAuthnId: Buffer;
    counter: number;
    transports: string;
    createdAt: Date;
    updatedAt: Date;
}
```

### Use default Prisma Adapter
```ts
import { PrismaAdapter } from "@astra-void/auth-kit/adapter";

const handler = AuthKit({
    adapter: PrismaAdapter(prisma),
});
```

#### Prisma schema for default Prisma Adapter
```ts
model User {
  id             String    @id @default(uuid())
  email          String    @unique
  hashedPassword String
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  passkeys       Passkey[]
}

model Passkey {
  id         String   @id @default(uuid())
  publicKey  Bytes
  userId     String
  webAuthnId Bytes    @unique
  counter    Int      @default(0)
  transports String
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])

  @@index([userId])
}
```
+ This Prisma schema is written for SQL-based databases (e.g. PostgreSQL, MySQL).

### Use passkey for login
```ts
const handler = AuthKit({
    adapter: YourAdapter,
    passkey: {
        rpId: "localhost", // for example
        rpName: "Passkey", // for example
        store: "memory" // for development, more store will be supported
    }
});

```

---

### `middleware.ts`

This middleware enables CSRF protection and guards protected routes.

```ts
import { AuthKitMiddleware } from "@astra-void/auth-kit/middleware";

const middleware = AuthKitMiddleware({
  loginPath: '/login', // default: '/login'
  logoutPath: '/logout', // default: '/logout'
  registerPath: '/register', // default: '/register'
  protectedRoutes: ['dashboard'], // protected routes
  alwaysSetToken: false, // default: false
});

export { middleware };
```

---

## 🧐 Client Usage

### Login

```ts
import { login } from '@astra-void/auth-kit/react';

await login({ email: 'test@example.com', password: '12345678' });
```

### Logout

```ts
import { logout } from '@astra-void/auth-kit/react';

await logout();
```

### Register

```ts
import { register } from '@astra-void/auth-kit/react';

await register({ email: 'test@example.com', password: '12345678' });
```

### Login with Passkey
```ts
import { loginPasskey } from "@astra-void/auth-kit/react/passkey";

await loginPasskey({ email: 'test@example.com' });
```

### Register new Passkey (should login)
```ts
import { registerPasskey } from "@astra-void/auth-kit/react/passkey";

await registerPasskey();
```

### Session Hook

```ts
import { useSession } from '@astra-void/auth-kit/react/hooks';

const { user, status } = useSession();
```

### Import Map
```ts
// Setup
import { AuthKit } from "@astra-void/auth-kit";

// Middleware
import { AuthKitMiddleware } from "@astra-void/auth-kit/middleware";

// Client API
import { login, logout } from "@astra-void/auth-kit/react";

// Passkey client API
import { loginPasskey } from "@astra-void/auth-kit/react/passkey";
```

---

## 🧰 Features

* ✅ Email/Password/Passkey Authentication
* 🔒 Automatic CSRF Protection
* 🍪 JWT-based Sessions
* 🔀 Middleware Route Protection
* ⚙️ Provider support (coming soon)
* 🔌 Adapter support: Prisma (only)

---

## 📌 Roadmap

* [ ] Social login (Google, GitHub, etc.)
* [ ] More adapter support: Drizzle, etc.

---

## 📜 License

MIT © astra-void
