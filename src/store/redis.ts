import { ChallengeStore } from "../providers";

const PREFIX = "passkey:challenge";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function RedisChallengeStore(redis: any): ChallengeStore {
    return {
        get: async (userId) => {
            const key = `${PREFIX}:${userId}`;
            return await redis.get(key);
        },
        set: async (userId, challenge) => {
            const key = `${PREFIX}:${userId}`;
            try {
                await redis.set(key, challenge, "EX", 300);
            } catch (err1) {
                try {
                    await redis.set(key, challenge, { EX: 300 });
                } catch (err2) {
                    console.error("Failed to set challenge:", err1, err2);
                }
            }
        },
        delete: async (userId) => {
            const key = `${PREFIX}:${userId}`;
            await redis.del(key);
            return;
        }
    };
}