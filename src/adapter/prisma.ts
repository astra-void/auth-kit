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
        // passkeys 미포함
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

    getPasskey: async (userId) => {
      const passkeys = await prisma.passkey.findMany({
        where: { userID: userId },
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

    createPasskey: async (userId, webAuthnID, publicKey, transports) => {
      const newKey = await prisma.passkey.create({
        data: {
          userID: userId,
          webAuthnID,
          publicKey,
          transports,
        },
      });
      return {
        id: newKey.id,
        publicKey: newKey.publicKey,
        userId: newKey.userID,
        webAuthnId: newKey.webAuthnID,
        counter: newKey.counter,
        transports: newKey.transports,
        createdAt: newKey.createdAt,
        updatedAt: newKey.updatedAt,
      };
    },

    deletePasskey: async (userId) => {
      await prisma.passkey.deleteMany({
        where: { userID: userId },
      });
      return null;
    },
  };
}
