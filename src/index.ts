import { App, ExpressReceiver } from '@slack/bolt';
import { SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET } from './env';

const receiver = new ExpressReceiver({
  signingSecret: SLACK_SIGNING_SECRET,
  scopes: ['chat:write'],
  endpoints: '/events',
  processBeforeResponse: true,
});

const app = new App({ receiver, token: SLACK_BOT_TOKEN });

app.command('/purge', async ({ ack, say, body: { text } }) => {
  await ack();

  const url = text.trim();

  const response = await fetch(url, {
    method: 'PURGE',
  }).then((r) => r.json());
  say(
    [
      `URL: ${url}`,
      'Result: OK',
      'Response:',
      '```',
      JSON.stringify(response),
      '```',
    ].join('\n'),
  );
});

export const handleFastlyPurgeBot = receiver.app;
