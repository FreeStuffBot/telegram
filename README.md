
# Telegram

A Telegram bot for announcing free games.

## Configuration

### Secrets

The bot needs some secret tokens:

- The FreeStuff API access token.
- The Telegram bot token.

#### On development machine

The secrets can be stored in a simple text file located at the root of the repository.

And for convenience a DOTENV file was used for the job: copy and rename the `example.env` file into `.env` and then update it's content with the suitable values.

#### On production machine

The secrets can be set into environment variables with the same names used in `example.env`.

## Deploying to Vercel

> The information is recorded as the dashboard is designed at `2021-11-15`

1. Connect the git repository to Vercel.
2. Go to Settings -> Project Settings.
    1. Set the root directory to `src`.
    2. Set the Node.js version to `14.x`.
3. Go to Settings -> Environment Variables.
    - Create each environment variable needed as specified in the `.env` file.
    - The value shouldn't include any quotes.
    - Set the environment to `Production` only.
4. Trigger a deployment by creating a git commit or if it's possible with the dashboard buttons they have.
5. Configure the Telegram commands using `npm run configure`.
6. Configure the Telegram webhook using `npm run set_webhook`.
7. Configure the FreeStuff webhook in the FreeStuff Dashboard.

## Endpoints

- FreeStuff Webhook: `{domain_name}/api/freestuff/{api_token}`
- Telegram Webhook: `{domain_name}/api/telegram/{bot_token}`
