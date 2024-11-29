import { randomBytes, pbkdf2 as pbkdf2Callback } from 'crypto';
import { promisify } from 'util';
const pbkdf2 = promisify(pbkdf2Callback);
export async function hashPassword(password) {
    const salt = randomBytes(16);
    const derivedKey = await pbkdf2(password, salt, 100000, 64, 'sha512');
    return `${salt.toString('hex')}:${derivedKey.toString('hex')}`;
}
export async function verifyPassword(password, hash) {
    const [salt, key] = hash.split(':');
    const derivedKey = await pbkdf2(password, Buffer.from(salt, 'hex'), 100000, 64, 'sha512');
    return key === derivedKey.toString('hex');
}
