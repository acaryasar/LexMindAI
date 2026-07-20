import * as crypto from 'crypto';

export class EncryptionUtil {
  private static algorithm = 'aes-256-cbc';
  private static keyLength = 32;
  private static ivLength = 16;
  private static saltLength = 64;
  private static iterations = 100000;

  private static getKey(salt: string, password: string): Buffer {
    return crypto.pbkdf2Sync(password, salt, this.iterations, this.keyLength, 'sha256');
  }

  static encrypt(text: string, password: string): string {
    const salt = crypto.randomBytes(this.saltLength).toString('hex');
    const iv = crypto.randomBytes(this.ivLength).toString('hex');
    const key = this.getKey(salt, password);

    const cipher = crypto.createCipheriv(this.algorithm, key, Buffer.from(iv, 'hex'));
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return salt + iv + encrypted;
  }

  static decrypt(encryptedData: string, password: string): string {
    const salt = encryptedData.substring(0, this.saltLength);
    const iv = encryptedData.substring(this.saltLength, this.saltLength + this.ivLength);
    const encrypted = encryptedData.substring(this.saltLength + this.ivLength);

    const key = this.getKey(salt, password);

    const decipher = crypto.createDecipheriv(this.algorithm, key, Buffer.from(iv, 'hex'));

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  static hashApiKey(apiKey: string): string {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }
}
