import { App, ExpressReceiver } from '@slack/bolt';
import { SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET } from './env';
import {
  purgeByNameAndMultipleSurrogateKeys,
  purgeByNameAndSurrogateKey,
  purgeByUrl,
} from './fastly';

const receiver = new ExpressReceiver({
  signingSecret: SLACK_SIGNING_SECRET,
  scopes: ['chat:write'],
  endpoints: '/events',
  processBeforeResponse: true,
});

const app = new App({ receiver, token: SLACK_BOT_TOKEN });

// URL purge
app.command('/purge', async ({ ack, respond, body: { text } }) => {
  await ack();

  const url = text.trim();

  const response = await purgeByUrl(url);
  await respond({
    text: [
      `URL: ${url}`,
      'Response:',
      '```',
      JSON.stringify(response),
      '```',
    ].join('\n'),
    response_type: 'in_channel',
  });
});

// Surrogate-Key purge
app.command('/purge-key', async ({ ack, respond, body: { text } }) => {
  await ack();

  // args is like `service-name key1 key2 key3 --soft`
  const args = text.trim().split(' ');
  const isSoft = args.includes('--soft');
  const other = args.filter((arg) => arg !== '--soft');
  const serviceName = other[0];
  const keys = other.slice(1);
  if (keys.length === 0) {
    await respond({
      text: 'ERROR: No surrogate keys specified',
      response_type: 'in_channel',
    });
    return;
  }

  if (keys.length === 1) {
    const key = keys[0];
    const response = await purgeByNameAndSurrogateKey(serviceName, key, isSoft);
    await respond({
      text: [
        `Surrogate-Key: ${key}`,
        'Response:',
        '```',
        JSON.stringify(response),
        '```',
      ].join('\n'),
      response_type: 'in_channel',
    });
    return;
  }

  const response = await purgeByNameAndMultipleSurrogateKeys(
    serviceName,
    keys,
    isSoft,
  );
  await respond({
    text: ['Response:', '```', JSON.stringify(response), '```'].join('\n'),
    response_type: 'in_channel',
  });
});

export const handleFastlyPurgeBot = receiver.app;
