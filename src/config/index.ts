import { config } from 'dotenv';
config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const CREDENTIALS = process.env.CREDENTIALS === 'true';
export const { NODE_ENV, PORT, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, SESSION_KEY, LOG_FORMAT, LOG_DIR, ORIGIN } = process.env;
