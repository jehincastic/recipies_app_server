// eslint-disable-next-line no-underscore-dangle
export const __prod__ = process.env.NODE_ENV === 'production';
export const COOKIE_NAME = process.env.COOKIE_NAME as string;
export const COOKIE_SECRET = process.env.COOKIE_SECRET as string;
export const COOKIE_AGE = 1000 * 60 * 60 * 24 * 365 * 10;
