import * as bcrypt from 'bcryptjs';
import { ulid } from 'ulid';
import { v4 as uuidv4 } from 'uuid';
import { randomBytes } from 'crypto';

export class Util {
  static generateHash = async (plainText: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(plainText, salt);
  };

  static validateHash = async (plainText: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(plainText, hash);
  };

  static randomBytes = (len = 16) => {
    return randomBytes(len).toString('hex');
  };

  static generateOtp(length = 6): string {
    const digits = '0123456789';
    let otp = '';
    const bytes = randomBytes(length);

    for (let i = 0; i < length; i++) {
      otp += digits[bytes[i] % 10];
    }

    return otp;
  }

  static generateUlid = (prefix?: string) => {
    return `${prefix ? prefix + '-' : ''}${ulid()}`;
  };

  static generateUuid = () => uuidv4();

  static isEmpty = (value: unknown): boolean => {
    return (
      value === null ||
      value === undefined ||
      (typeof value === 'object' && Object.keys(value).length === 0) ||
      (typeof value === 'string' && value === '' && value.trim().length === 0)
    );
  };

  static randomCode = (len = 6) => {
    return Math.random()
      .toString(36)
      .slice(2, 2 + len);
  };

  static randomNumber = (n = 4) => {
    const min = Math.pow(10, n - 1);
    const max = Math.pow(10, n) - 1;

    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  static roundTo = (num: number, nrdecimals: number) => {
    const n = Number(num.toFixed(nrdecimals));

    return n > num ? Number((n - 1 / Math.pow(10, nrdecimals)).toFixed(nrdecimals)) : n;
  };

  static randomFromInterval = (min: number, max: number, precision = 2): number => {
    const random = Math.random() * (max - min) + min;

    return parseFloat(random.toFixed(precision));
  };

  static randomString = (len = 10) => {
    const p = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    return [...Array(len)].reduce(a => a + p[~~(Math.random() * p.length)], '');
  };

  static slugify(str: string): string {
    return str.toLowerCase().replace(/\s+/g, '-');
  }

  static calculateExpiryDate(days: number): Date {
    const now = new Date();

    return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  }

  static formatDateTimeToUtc(date: Date = new Date()): string {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'full',
      timeStyle: 'long',
      timeZone: 'UTC',
    }).format(date);
  }
}
