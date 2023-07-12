import { App, ExpressReceiver } from '@slack/bolt';
import { SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET } from './env';
import {
  purgeByNameAndMultipleSurrogateKeys,
  purgeByNameAndSurrogateKey,
  purgeByUrl,
} from './fastly';
import { KnownError, NoServiceFoundError } from './errors';

const receiver = new ExpressReceiver({
  signingSecret: SLACK_SIGNING_SECRET,
  scopes: ['chat:write'],
  endpoints: '/events',
  processBeforeResponse: true,
});

const app = new App({ receiver, token: SLACK_BOT_TOKEN });

app.event('app_mention', async ({ say, event: { text } }) => {
  try {
    const args = text.trim().split(' ').slice(1);
    if (args.length === 0) {
      await say(
        [
          'ERROR: No arguments',
          'You can use like `purge https://example.com/path/to/purge-target`',
        ].join('\n'),
      );
    }

    // URL purge
    if (args.length === 2 && args[0] === 'purge') {
      const url = args[1].replaceAll(/<|>/g, '');
      const response = await purgeByUrl(url);
      await say({
        text: [
          `URL: ${url}`,
          'Response:',
          '```',
          JSON.stringify(response),
          '```',
        ].join('\n'),
      });
      return;
    }

    // Surrogate key purge
    if (args[0] === 'purge-key') {
      // args is like `purge-key service-name key1 key2 key3 --soft`
      const parametersWithOption = args.slice(1);
      const isSoft = parametersWithOption.includes('--soft');
      const parameters = parametersWithOption.filter((arg) => arg !== '--soft');
      const serviceName = parameters[0];
      const keys = parameters.slice(1);
      if (keys.length === 0) {
        await say({
          text: 'ERROR: No surrogate keys specified',
        });
        return;
      }

      if (keys.length === 1) {
        const key = keys[0];
        const response = await purgeByNameAndSurrogateKey(
          serviceName,
          key,
          isSoft,
        );
        await say({
          text: [
            `Surrogate-Key: ${key}`,
            'Response:',
            '```',
            JSON.stringify(response),
            '```',
          ].join('\n'),
        });
        return;
      }

      const response = await purgeByNameAndMultipleSurrogateKeys(
        serviceName,
        keys,
        isSoft,
      );
      await say({
        text: [
          `Service: ${serviceName}`,
          'Response:',
          '```',
          JSON.stringify(response),
          '```',
        ].join('\n'),
      });
    }
  } catch (err) {
    console.error(err);
    if (err instanceof KnownError) {
      await say(err.message);
      return;
    }

    await say({
      text: [
        'ERROR: Something went wrong',
        '```',
        `${JSON.stringify(err)}`,
        '```',
      ].join('\n'),
    });
  }
});

export const handleFastlyPurgeBot = receiver.app;
