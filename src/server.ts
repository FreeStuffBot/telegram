import { Hono } from 'hono';
import { createHonoHandler } from 'freestuff';

interface Env {
	TELEGRAM_BOT_TOKEN: string;
}

const publicKey = 'MCowBQYDK2VwAyEANmqbt6GQgJGjbiZNB4K1yG9/prp7soLJ9/JlJCU4Kag=';
let env: Env | null = null;

const app = new Hono<{ Bindings: Env }>();
app.all('*', (c, next) => {
  env = c.env;
  return next();
});
app.post('/event', ...createHonoHandler(publicKey));

export { env };
export default app;
