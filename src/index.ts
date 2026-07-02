import { on } from 'freestuff'
import { sendToAll } from './product-post'


type HonoEvent = {
  $hono: {
    executionCtx: ExecutionContext
  }
}

on('fsb:event:ping', (event) => {
  console.log('Received ping event:', event);
});

on('fsb:event:announcement_created', (event) => {
  console.log('/event announcement_created:', JSON.stringify(event.data))
  const ctx = (event as typeof event & HonoEvent).$hono.executionCtx;
  ctx.waitUntil(sendToAll(event.data.resolvedProducts));
});

import app from './server'

export default app