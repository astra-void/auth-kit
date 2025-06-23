import argon2 from "argon2";
import bcrypt from "bcrypt";
import { HashingAlgorithm } from ".";

export async function hashPassword(password: string, algorithm: HashingAlgorithm = 'argon2') {
    switch (algorithm) {
        case 'bcrypt':
            return bcrypt.hash(password, 10);
        case 'argon2':
            return argon2.hash(password);
    }
}

export async function verifyPassword(password: string, hash: string, algorithm: HashingAlgorithm = 'argon2') {
    switch (algorithm) {
        case 'bcrypt':
            return bcrypt.compare(password, hash)
        case 'argon2':
            return argon2.verify(hash, password);
    }
}
