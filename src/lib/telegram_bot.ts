
import { Telegraf } from 'telegraf';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!BOT_TOKEN) throw new Error('The TELEGRAM_BOT_TOKEN has not been set!');

export const bot = new Telegraf(BOT_TOKEN);
export const commandsDescriptions: Record<string, string> = {};

export default bot;

bot.start((ctx) => ctx.replyWithHTML(`
You have just met the <b>FreeStuff Master</b>. Who shall only deal with his grand masters.

If you're looking for guidance, please check our channel <a href="https://t.me/thefreestuff">FreeStuff</a>
`));

commandsDescriptions['whoami'] = 'Show the details of the user sending this message.';
bot.command('whoami', (ctx) => ctx.replyWithHTML(`
<u>User information:</u>

<b>ID:</b> <code>${new String(ctx.from.id)}</code>
<b>Username:</b> <code>${new String(ctx.from.username)}</code>
<b>First name:</b> <code>${new String(ctx.from.first_name)}</code>
<b>Last name:</b> <code>${new String(ctx.from.last_name)}</code>
<b>Language code:</b> <code>${new String(ctx.from.language_code)}</code>
<b>Bot:</b> <code>${new String(ctx.from.is_bot)}</code>
`));
