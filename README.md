# fastly-purge-bot

A Slack bot implementation for Fastly purge API.

**This is not an official product.**

## Setup

### Create Slack App

- Add `app_mention` on Subscriptions > Subscribe to bot events.
- Add `app_mentions:read` and `chat:write` on OAuth & Permissions > Scopes.
- Get and set to .env `SLACK_SIGNING_SECRET` and `SLACK_BOT_TOKEN`.

  - `SLACK_SIGNING_SECRET` is on Basic Information > App Credentials.
  - `SLACK_BOT_TOKEN` is on OAuth & Permissions > OAuth Tokens & Redirect URLs, after install to Workspace.

### Create Fastly API Token

URL: https://manage.fastly.com/account/personal/tokens

Create a token with scope...

- `purge_select`
- `global:read` (for searching service id by name for convenience)

## Env vars

| Name                 | Description          | Note     |
| :------------------- | :------------------- | :------- |
| SLACK_SIGNING_SECRET | Slack signing secret | required |
| SLACK_BOT_TOKEN      | Slack bot token      | required |
| FASTLY_API_TOKEN     | Fastly API token     | required |

## Deploy

```shell
gcloud functions deploy handleFastlyPurgeBot \
  --runtime=nodejs18 \
  --allow-unauthenticated \
  --trigger-http \
  --region=asia-northeast1 \
  --project=<your-project-id>
```

## How to use

### URL Purge

https://developer.fastly.com/reference/api/purging/#purge-single-url

```
@BotMention purge <url>
```

### Surrogate Key Purge

https://developer.fastly.com/reference/api/purging/#purge-tag

```
@BotMention purge-key <service-name> <surrogate-key>
```

### Multiple Surrogate Key Purge

https://developer.fastly.com/reference/api/purging/#bulk-purge-tag

```
@BotMention purge-keys <service-name> <surrogate-key1> <surrogate-key2> ...
```

### Options

| Name   | Description                      |
| :----- | :------------------------------- |
| --soft | set fastly-soft-purge header '1' |
