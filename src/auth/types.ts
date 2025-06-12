export interface User {
    id: string;
    email?: string;
    hashedPassword?: string;
    createdAt: Date;
    updatedAt: Date;
}

export type HashingAlgorithm = 'bcrypt' | 'argon2';