/* eslint-disable @typescript-eslint/no-explicit-any */
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

function mapPasskey(passkey: Passkey) {
  return {
    id: passkey.id,
    publicKey: passkey.publicKey,
    userId: passkey.userId,
    webAuthnId: passkey.webAuthnId,
    counter: passkey.counter,
    transports: passkey.transports,
    createdAt: passkey.createdAt,
    updatedAt: passkey.updatedAt,
  }
}

function mapPasskeys(passkeys: Passkey[]): Passkey[] {
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
}

export function PrismaAdapter(prisma: any): Adapter {
  return {
    createUser: async (email, hashedPassword, username) => {
      try {
        const data: { email: string; hashedPassword: string; username?: string } = { email, hashedPassword };
        if (username) data.username = username;
        const user = await prisma.user.create({ data })
        return mapUser(user);
      } catch (error: any) {
        if (error?.code === 'P2002') {
          throw new Error("User already exists");
        }
        console.error("[AUTH-KIT-ERROR] Failed to create user", error);
        throw new Error("Failed to create user");
      }
    },

    getUser: async (id) => {
      const user = await prisma.user.findUnique({
        where: { id },
        include: { passkeys: true },
      });
      return user ? mapUser(user) : null;
    },

    getUserByEmail: async (email) => {
      const user = await prisma.user.findUnique({
        where: { email },
        include: { passkeys: true },
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
      return mapPasskey(passkey);
    },

    getPasskey: async (userId) => {
      const passkeys = await prisma.passkey.findMany({
        where: { userId: userId },
      });
      return passkeys ? mapPasskeys(passkeys) : null;
    },

    getPasskeyByEmail: async (email) => {
      const user: AdapterUser = await prisma.user.findUnique({
        where: { email },
      });
      if (!user) return null;

      const passkeys = await prisma.passkey.findMany({
        where: { userId: user.id }
      });
      if (passkeys.length === 0) return null;

      return passkeys ? mapPasskeys(passkeys) : null;
    },

    getPasskeyByRaw: async (webAuthnId) => {
        const passkey = await prisma.passkey.findUnique({
          where: { webAuthnId }
        });
        
        return passkey ? mapPasskey(passkey) : null;
    },

    getPasskeys: async () => {
      const passkeys = await prisma.passkey.findMany();
      
      return passkeys ? mapPasskeys(passkeys) : null;
    },

    updatePasskey: async (passkeyId, data) => {
      const passkey = await prisma.passkey.update({
        where: { id: passkeyId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

      return mapPasskey(passkey);
    },

    deletePasskey: async (userId) => {
      await prisma.passkey.deleteMany({
        where: { userId: userId },
      });
      return null;
    },
  };
}
