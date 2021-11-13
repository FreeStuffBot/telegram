
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
