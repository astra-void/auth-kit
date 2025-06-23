import { Adapter, AdapterUser, Passkey } from "./types";

function mapUser(user: AdapterUser): AdapterUser {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    hashedPassword: user.hashedPassword,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    ...(user.passkeys && {
      passkeys: user.passkeys.map((p: Passkey) => ({
        id: p.id,
        publicKey: p.publicKey,
        userId: p.userId,
        webAuthnId: p.webAuthnId,
        counter: p.counter,
        transports: p.transports,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
    }),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function PrismaAdapter(prisma: any): Adapter {
  return {
    createUser: async (email, hashedPassword, username) => {
      const data: { email: string; hashedPassword: string; username?: string } = { email, hashedPassword };
      if (username) data.username = username;
      const user = await prisma.user.create({ data })
      return mapUser(user);
    },

    getUser: async (id) => {
      const user = await prisma.user.findUnique({
        where: { id },
      });
      return user ? mapUser(user) : null;
    },

    getUserByEmail: async (email) => {
      const user = await prisma.user.findUnique({
        where: { email },
      });
      return user ? mapUser(user) : null;
    },

    updateUser: async (userId, data) => {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
      return mapUser(updatedUser);
    },

    deleteUser: async (userId) => {
      await prisma.user.delete({ where: { id: userId } });
      return null;
    },

    createPasskey: async (userId, webAuthnId, publicKey, transports) => {
      const passkey = await prisma.passkey.create({
        data: {
          userId,
          webAuthnId,
          publicKey,
          transports,
        },
      });
      return {
        id: passkey.id,
        publicKey: passkey.publicKey,
        userId: passkey.userId,
        webAuthnId: passkey.webAuthnId,
        counter: passkey.counter,
        transports: passkey.transports,
        createdAt: passkey.createdAt,
        updatedAt: passkey.updatedAt,
      };
    },

    getPasskey: async (userId) => {
      const passkeys = await prisma.passkey.findMany({
        where: { userId: userId },
      });
      return passkeys.map((p: Passkey) => ({
        id: p.id,
        publicKey: p.publicKey,
        userId: p.userId,
        webAuthnId: p.webAuthnId,
        counter: p.counter,
        transports: p.transports,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));
    },

    getPasskeyByEmail: async (email) => {
      const user = await prisma.user.findUnique({
        where: { email },
        include: { passkeys: true },
      });

      if (!user || !user.passkeys.length) return null;

      return user.passkeys.map((p: Passkey) => ({
        id: p.id,
        publicKey: p.publicKey,
        userId: p.userId,
        webAuthnId: p.webAuthnId,
        counter: p.counter,
        transports: p.transports,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));
    },

    updatePasskey: async (email, data) => {
      const passkey = await prisma.passkey.update({
        where: { email },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

      return {
        id: passkey.id,
        publicKey: passkey.publicKey,
        userId: passkey.userId,
        webAuthnId: passkey.webAuthnId,
        counter: passkey.counter,
        transports: passkey.transports,
        createdAt: passkey.createdAt,
        updatedAt: passkey.updatedAt,
      };
    },

    deletePasskey: async (userId) => {
      await prisma.passkey.deleteMany({
        where: { userId: userId },
      });
      return null;
    },
  };
}
