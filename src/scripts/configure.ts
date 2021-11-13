import { config as loadENV } from 'dotenv';
loadENV();

import { bot, commandsDescriptions } from '../lib/telegram_bot';

console.log('Updating commands...')
bot.telegram.setMyCommands(
    Object.entries(commandsDescriptions).map(([command, description]) => {
        return { command, description }
    })
);

console.info('Done.');