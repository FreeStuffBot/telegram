import { Hono } from 'hono';
import { createHonoHandler } from 'freestuff/hono';

interface Env {
  TELEGRAM_BOT_TOKEN: string;
  FREESTUFF_PUBLIC_KEY: string;
}

let env: Env | null = null;

const app = new Hono<{ Bindings: Env }>();
app.all('*', (c, next) => {
  env = c.env;

  // Warn if TELEGRAM_BOT_TOKEN is not set
  if (!env?.TELEGRAM_BOT_TOKEN) {
    console.warn('⚠️  WARNING: TELEGRAM_BOT_TOKEN environment variable is not set!');
    console.warn('   Set it in your .env file (for local development) or configure it in wrangler.jsonc/secrets');
  }

  // Warn if FREESTUFF_PUBLIC_KEY is not set
  if (!env?.FREESTUFF_PUBLIC_KEY) {
    console.warn('⚠️  WARNING: FREESTUFF_PUBLIC_KEY environment variable is not set!');
    console.warn('   Get it from the FreeStuff Dashboard: https://dashboard.freestuffbot.xyz');
  }
  
  return next();
});

// @ts-ignore
app.post('/event', ...createHonoHandler<Env>(c => c.env?.FREESTUFF_PUBLIC_KEY));

export { env };
export default app;