import dotenv from 'dotenv';

if (process.env.NODE_ENV === 'development') {
  dotenv.config();
}

export const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET as string;
export const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN as string;
export const FASTLY_API_TOKEN = process.env.FASTLY_API_TOKEN as string;
