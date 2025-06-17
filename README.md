# @astra-void/auth-kit

> Lightweight authentication kit for Next.js
> **Alpha version – subject to change**

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

```md
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
    createUser?: (email: string, hashedPassword: string) => Promise<AdapterUser>;
    getUser?: (id: string) => Promise<AdapterUser>;
    getUserByEmail?: (email: string) => Promise<AdapterUser | null>;
    updateUser?: (user: AdapterUser) => Promise<AdapterUser>;
    deleteUser?: (userId: string) => Promise<null>;
}
```

### The User interface should be like
```ts
export interface User {
    id: string;
    email?: string;
    hashedPassword?: string;
    createdAt: Date;
    updatedAt: Date;
}
```

#### Adapter Example (e.g. Prisma)

```ts
const PrismaAdapter: Adapter = {
  getUserByEmail: async (email) => {
    const user = await prisma.user.findUnique({ where: { email } });
    return user || null;
  },
  createUser: async (email, hashedPassword) => {
    const user = await prisma.user.create({
      data: { email, hashedPassword },
    });
    return user;
  }
};
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
  protectedRoutes: ['dashboard'], // protect routes
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

### Session Hook

```ts
import { useSession } from '@astra-void/auth-kit/react/hooks';

const { user, status } = useSession();
```

---

## 🧰 Features

* ✅ Email/Password Authentication
* 🔒 Automatic CSRF Protection
* 🍪 JWT-based Sessions
* 🔀 Middleware Route Protection
* ⚙️ Provider support (coming soon)

---

## 📌 Roadmap

* [ ] Social login (Google, GitHub, etc.)
* [ ] Adapter support: Prisma, Drizzle, etc.
* [ ] Magic Link / Passkey support

---

## 📜 License

MIT © astra-void
